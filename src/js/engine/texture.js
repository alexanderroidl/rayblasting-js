class Texture {
	constructor(object, data) {
		this._object = object;
		this._imageData = data;

		if(object) {
			var canvas = new Canvas(null, object.width, object.height);
			canvas.context.drawImage(object, 0, 0);
			this._imageData = canvas.context.getImageData(0, 0, object.width, object.height);
			canvas.remove();
		}
	}

	get imageData() { return this._imageData; }
	get rawData() { return this._imageData.data; }
	get size() {
		return {
			width: this._imageData.width,
			height: this._imageData.height
		}
	}
}
