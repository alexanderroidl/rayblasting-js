class TextureFactory {
	constructor(textureSize) {
		this._textures = [];
		this._textureSize = textureSize ? textureSize : Config.defaultTextureSize;
		this._guide = [];
	}

	get collection() { return this._textures; }
	set size(textureSize) { this._textureSize = textureSize; }

	get(id, name) {
		if(name) {
			var guide = this.guide(name);
			if(guide != null) id += guide.start;
			else return null;
		}
		return (id in this._textures ? this._textures[id] : null);
	}

	guide(name) {
		return (name in this._guide ? this._guide[name] : null);
	}

	loadMap(map, tileSize, transparentColor, gap) {
		if(!tileSize) tileSize = this._textureSize;
		if(gap !== undefined) console.log("gap is ", gap);
		if(!gap) gap = 0;

		var useSize = this._textureSize;

		var ratio = useSize / tileSize;
		var width = map.width * ratio,
			height = map.height * ratio;

		// Load image on canvas
		var canvas = new Canvas(null, width, height);
		canvas.context.drawImage(map, 0, 0, width, height);

		// Remove transparency color
		if(transparentColor) {
			var color = Util.hexToRgb(transparentColor);
			var imgData = canvas.context.getImageData(0, 0, width, height);

			for(var i = 0; i < imgData.data.length; i += 4) {
				if(imgData.data[i] == color.r &&
					imgData.data[i+1] == color.g &&
					imgData.data[i+2] == color.b) {
						imgData.data[i+3] = 0;
					}
			}
			canvas.context.putImageData(imgData, 0, 0);
		}

		// Extract pixel data for each texture
		var texturesImgData = [];
		for(var y = 0; y < map.height / tileSize; y++) {
			for(var x = 0; x < map.width / tileSize; x++) {
				var p = gap + useSize;
				var imgData = canvas.context.getImageData(x * p, y * p, useSize, useSize);

				texturesImgData.push(imgData);
			}
		}

		// Save starting index and count of created textures
		this._guide[map.title] = {
			start: this._textures.length,
			length: texturesImgData.length
		};

		// Add to collection
		for(var imgData in texturesImgData)
			this._textures.push(new Texture(null, texturesImgData[imgData]));
	}
}
