class UI {
	constructor(boardCanvas) {
		this._element = null;
		this._fpsElement = null;
		this._boardCanvas = boardCanvas;
		this._boardProgressBarElement = null;

		this._domSetup();
	}

	_domSetup() {
		var _element = document.createElement("div");
		_element.id = "ui";
		document.body.appendChild(_element);

		var _fpsElement = document.createElement("div");
		_fpsElement.className = "ui-fps";
		_element.appendChild(_fpsElement);

		var _loadingBarElement = document.createElement("div");
		_loadingBarElement.className = "ui-load";
		_element.appendChild(_loadingBarElement);

		this._element = _element;
		this._fpsElement = _fpsElement;
		this._loadingBarElement = _loadingBarElement;

		if(this._boardCanvas) {
			var boardCanvas = this._boardCanvas.element;
			var boardWrapper = document.createElement("div");
			boardWrapper.className = "canvas-wrapper";
			boardCanvas.parentNode.insertBefore(boardWrapper, boardCanvas);
			boardWrapper.appendChild(boardCanvas);

			var _boardOverlay = document.createElement("div");
			_boardOverlay.className = "ui-canvas-overlay";
			boardWrapper.appendChild(_boardOverlay);

			this._boardProgressBarElement = document.createElement("div");
			this._boardProgressBarElement.className = "ui-load";
			_boardOverlay.appendChild(this._boardProgressBarElement);
		}

		return this;
	}

	set fps(fps) {
		this._fpsElement.innerHTML = Math.round(fps) + " FPS";
	}

	setLoadingProgress(progress) {
		this._loadingBarElement.style.width = Math.round(progress * 100) + "%";
		return this;
	}

	hideLoadingBar() {
		this._loadingBarElement.classList.add("hidden");
		return this;
	}

	setBoardLoadingProgress(progress) {
		this._boardProgressBarElement.style.width = Math.round(progress * 100) + "%";
		return this;
	}

	hideBoardLoadingBar() {
		this._boardProgressBarElement.classList.add("hidden");
		return this;
	}
}
