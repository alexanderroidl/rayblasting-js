class RayCast {
	constructor(level, screenSize, screenX) {
		this._level = level;

		var cameraX = screenX * 2 / screenSize.width - 1;
		this._position = level.player.position;
		this._direction = level.player.rotation.add(level.player.cameraPlane.multiply(cameraX));
		this._screenX = screenX;
		this._screenSize = screenSize;

		this._isSideHit = null;
		this._perpWallDistance = null;
		this._wallX = null;
		this._step = null;
		this._lineHeight = null;
		this._drawStart = null;
		this._drawEnd = null;
		this._targetPoint = null;

		this._perform();
	}

	get position() { return this._position; }
	get direction() { return this._direction; }
	get targetPoint() { return this._targetPoint; }
	get isSideHit() { return this._isSideHit; }
	get drawStart() { return this._drawStart; }
	get drawEnd() { return this._drawEnd; }
	get screenX() { return this._screenX; }
	get step() { return this._step; }
	get perpWallDistance() { return this._perpWallDistance; }

	get wallX() { return this._wallX; }
	set wallX(wallX) { this._wallX = wallX; }

	get lineHeight() { return this._lineHeight; }
	set lineHeight(perpWallDistance) {
		var screenHeight = this._screenSize.height;

		this._lineHeight = (screenHeight / perpWallDistance) << 0;

		this._drawStart = ((screenHeight - this._lineHeight) / 2) << 0;
		if(this._drawStart < 0) this._drawStart = 0;

		this._drawEnd = ((screenHeight + this._lineHeight) / 2) << 0;
		if(this._drawEnd >= screenHeight) this._drawEnd = screenHeight - 1;

		return this;
	}

	_perform() {
		var mapPoint = this._position.point;

		var deltaDist =
			new Vector(
				Math.sqrt(1 + Math.pow(this._direction.y, 2) / Math.pow(this._direction.x, 2)),
				Math.sqrt(1 + Math.pow(this._direction.x, 2) / Math.pow(this._direction.y, 2)));


		var step = new Point();
		var slideDist = new Vector();

		// Calculate step and initial side distance
		if(this._direction.x < 0) {
			step.x = -1;
			slideDist.x = (this._position.x - mapPoint.x) * deltaDist.x;
		} else {
			step.x = 1;
			slideDist.x = (mapPoint.x + 1 - this._position.x) * deltaDist.x;
		}

		if(this._direction.y < 0) {
			step.y = -1;
			slideDist.y = (this._position.y - mapPoint.y) * deltaDist.y;
		} else {
			step.y = 1;
			slideDist.y = (mapPoint.y + 1 - this._position.y) * deltaDist.y;
		}

		// Detect hit and side hit
		var hit = false, side = false;

		while(!hit) {
			if(slideDist.x < slideDist.y) {
				slideDist.x += deltaDist.x;
				mapPoint.x += step.x;
				side = false;
			} else {
				slideDist.y += deltaDist.y;
				mapPoint.y += step.y;
				side = true;
			}

			if(this._level.map(mapPoint.x, mapPoint.y) > 0)
				hit = true;
		}

		// Calculate distance projected on camera direction
		var perpWallDist;

		if(!side) perpWallDist = (mapPoint.x - this._position.x + (1 - step.x) / 2) / this._direction.x;
		else perpWallDist = (mapPoint.y - this._position.y + (1 - step.y) / 2) / this._direction.y;

		// Set ray up
		this.lineHeight = perpWallDist;

		this._step = step;
		this._targetPoint = mapPoint;
		this._isSideHit = side;
		this._perpWallDistance = perpWallDist;
	}
}
