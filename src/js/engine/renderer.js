class Renderer {
	constructor(level) {
		this._level = level;
	}

	get isReady() { return this._level !== undefined && this._level.player; }

	get level() { return this._level; }
	get viewer() { return this._level.player; }

	set level(level) { this._level = level; }

	run(ctx, size) {
		if(!this.isReady) return;

		// Create image data based on screen size
		var imgData = ctx.createImageData(size.width, size.height);
		var distances = [];

		// Each screen width pixel
		for (var x = 0; x < imgData.width; x++) {
			// Draw background colors
			// TODO: Implement textures/backgrounds instead
			for(var y = 0; y < imgData.height; y++) {
				var i = (x + y * imgData.width) * 4;

				var color = (y < imgData.height/2) ? 221 : 102;
				imgData.data[i] = color;
				imgData.data[i+1] = color;
				imgData.data[i+2] = color;
				imgData.data[i+3] = 255;
			}
			// Perform raycast
			var ray = new RayCast(this._level, size, x);

			// Render walls
			this._wall(imgData, ray);

			// Save distance
			distances.push(ray.perpWallDistance);
		}

		this._objects(imgData, distances);

		// Put image data to canvas
		ctx.putImageData(imgData, 0, 0);

		// Draw minimap
		this._minimap(ctx, size);
	}

	_wall(imgData, ray) {
		var rayPos = ray.direction, rayDir = ray.direction;
		var target = ray.targetPoint;

		var textureId = this._level.map(target.x, target.y) - 1;
		var texture = this._level.textures.get(textureId);

		// Get exact hit position on wall
		var wallX;
	   	if (!ray.isSideHit) wallX = this.viewer.y + ray.perpWallDistance * rayDir.y;
	   	else wallX = this.viewer.x + ray.perpWallDistance * rayDir.x;
	   	wallX -= BitMath.floor(wallX);

		// X coordinate of the texture
		var textureX = BitMath.floor(wallX * texture.imageData.width);
		if((!ray.isSideHit && rayDir.x > 0) || (ray.isSideHit && rayDir.y < 0))
			textureX = texture.imageData.width - textureX - 1;

		// Draw texture
		for(var y = ray.drawStart; y < ray.drawEnd; y++) {
			var textureY = BitMath.floor(((y * 2 - imgData.height + ray.lineHeight) * texture.imageData.height) / ray.lineHeight / 2);

			var screenPixelIndex = (ray.screenX + y * imgData.width) * 4;
			var texturePixelIndex = (textureX + textureY * texture.imageData.width) * 4;

			for(var i = 0; i < 4; i++) {
				var color = texture.rawData[texturePixelIndex+i];

				if(ray.isSideHit && i != 3) // Side hit + color not alpha
					color *= 1 - Config.darkenSidesAmount;

				imgData.data[screenPixelIndex+i] = color;
			}
		}

		// Save wall spot
		ray.wallX = wallX;
	}

	_objects(imgData, distances) {
		var player = this._level.player; // Shortcut

		// Sort objects by distance
		var sortedObjects = this._level.objects.sort((a, b) => {
			return (a.distance(player) - b.distance(player)) * -1;
		});
		
		for(var _object in sortedObjects) {
			var obj = sortedObjects[_object]; // Shortcut

			var relPosition = obj.position.subtract(player.position);

			var invDet = 1 / (player.cameraPlane.x * player.rotation.y - player.rotation.x * player.cameraPlane.y);

			var transformX = invDet * (player.rotation.y * relPosition.x - player.rotation.x * relPosition.y),
				transformY = invDet * (-player.cameraPlane.y * relPosition.x + player.cameraPlane.x * relPosition.y);

			var spriteScreenX = BitMath.floor((imgData.width / 2) * (1 + transformX / transformY));

			//calculate height of the sprite on screen
			var spriteHeight = BitMath.abs(BitMath.floor(imgData.height / transformY)); //using "transformY" instead of the real distance prevents fisheye

			//calculate lowest and highest pixel to fill in current stripe
			var drawStartY = BitMath.floor(-spriteHeight / 2 + imgData.height / 2);
			if(drawStartY < 0) drawStartY = 0;

			var drawEndY = BitMath.floor(spriteHeight / 2 + imgData.height / 2);
			if(drawEndY >= imgData.height) drawEndY = imgData.height - 1;

			//calculate width of the sprite
			var spriteWidth = BitMath.abs(BitMath.floor(imgData.height / (transformY)));

			var drawStartX = BitMath.floor(-spriteWidth / 2 + spriteScreenX);
			
			if(drawStartX < 0) drawStartX = 0;

			var drawEndX = BitMath.floor(spriteWidth / 2 + spriteScreenX);
			if(drawEndX >= imgData.width) drawEndX = imgData.width - 1;

			
			//loop through every vertical stripe of the sprite on screen
			for(var stripe = drawStartX; stripe < drawEndX; stripe++) {
				var texX = BitMath.floor((stripe - (-spriteWidth / 2 + spriteScreenX)) * obj.texture.size.width / spriteWidth);

				//the conditions in the if are:
				//1) it's in front of camera plane so you don't see things behind you
				//2) it's on the screen (left)
				//3) it's on the screen (right)
				//4) ZBuffer, with perpendicular distance
				if(!(transformY > 0 && stripe > 0 && stripe < imgData.width && transformY < distances[stripe]))
					continue;

				for(var y = drawStartY; y < drawEndY; y++) { //for every pixel of the current stripe
					var d = BitMath.floor(y - imgData.height / 2 + spriteHeight / 2);
					var texY = BitMath.floor((d * obj.texture.size.height) / spriteHeight);

					var i = (obj.texture.size.width * texY + texX) * 4;
					var j = (imgData.width * y + stripe) * 4;

					if(obj.texture.rawData[i+3]) {
						imgData.data[j] = obj.texture.rawData[i];
						imgData.data[j+1] = obj.texture.rawData[i+1];
						imgData.data[j+2] = obj.texture.rawData[i+2];
						// TODO: Implement transparency

						//console.log(texX, texY, drawEndY - drawStartY)
					}
				}
			}
		}
	}

	_minimap(ctx, size) {
		var mapSize = size.width * Config.minimapWidth;
		var mapPos = new Vector(size.width, size.height).subtract(mapSize);

		// Draw minimap background
		ctx.fillStyle = "#00ffff";
		ctx.rect(mapPos.x, mapPos.y, mapSize, mapSize);
		ctx.fill();

		// Draw minimap map
		var map = this._level.map(),
			blockSize = mapSize / Config.minimapTiles;

		for(var y = 0; y < map.length; y++) {
			for(var x = 0; x < map[y].length; x++) {
				if(map[y][x] > 0) {
					ctx.fillStyle = "#333333";
				} else ctx.fillStyle = "#dddddd";

				var relative =
					new Vector(x, y)
						.add(Config.minimapTiles / 2)
						.subtract(this.viewer.position);

				var target = mapPos.add(relative.multiply(blockSize));
				var size = { width: blockSize, height: blockSize };

				if(target.x < mapPos.x) {
					size.width -= mapPos.x - target.x;
					if(size.width < 0) size.width = 0;
					target.x = mapPos.x;
				}

				if(target.y < mapPos.y) {
					size.height -= mapPos.y - target.y;
					if(size.height < 0) size.height = 0;
					target.y = mapPos.y;
				}

				if(size.width || size.height)
					ctx.fillRect(target.x, target.y, size.width, size.height);

			}
		}

		// Draw player
		var playerSize = blockSize * Config.minimapPlayerSize / 2;
		var playerPos = mapPos.add(Vector.scalar(Config.minimapTiles / 2).multiply(blockSize));

		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.arc(playerPos.x, playerPos.y, playerSize, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(playerPos.x, playerPos.y);
		var cxLineTo = playerPos.add(this.viewer.rotation.multiply(blockSize * 1.25));
		ctx.lineTo(cxLineTo.x, cxLineTo.y);
		ctx.closePath();
		ctx.stroke();
	}
}
