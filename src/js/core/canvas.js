class Canvas {
	constructor(id, width, height) {
		if(height === undefined) height = width;

		this._element = this._createElement(id, width, height);
		this._ctx = this._element.getContext('2d');
	}

	_createElement(id, width, height) {
		var _element = document.createElement("canvas");

		if(id) _element.id = id;
		if(width) _element.width = width;
		if(height) _element.height = height;

		return _element;
	}

	get element() { return this._element; }
	get context() { return this._ctx; }

	get size() {
		return {
			width: this._width,
			height: this._height
		}
	}

	get virtualSize() {
		return {
			width: this._element.width,
			height: this._element.height
		}
	}

	updateSize() {
		this._width = this._element.scrollWidth;
		this._height = this._element.scrollHeight;

		this._element.width = this._width;
		this._element.height = this._height;
	}

	drawTexture(texture) {
		this._ctx.putImageData(texture.imageData, 0, 0);
	}
}
