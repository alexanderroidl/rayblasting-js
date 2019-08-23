class Browser extends EventCollection {
	constructor(title) {
		super();

		this._canvas = null;
		this._ui = null;
		this._keyStates = new Array(525);
		this._nipples = [];
		this.title = title;

		this._addEventListeners();
		this._createMobileControls();
	}

	get ui() { return this._ui; }
	get canvas() { return this._canvas; }
	get keyStates() { return this._keyStates; }
	get nipples() { return this._nipples; }
	get isReady() { return this._canvas != null; }
	get isMobile() { return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)); }

	set title(title) { document.title = title; }

	_addEventListeners() {
		window.addEventListener("resize", () => {
			if(this.isReady) this._canvas.updateSize();
			this.trigger("resize", [ {}, this._canvas.size ]);
		});

		document.addEventListener("keydown", (e) => {
			this._keyStates[e.keyCode] = true;
			this.trigger("keyDown", [{ key: e.key, keyCode: e.keyCode }]); // TO-DO: Remove
		});

		document.addEventListener("keyup", (e) => {
			this._keyStates[e.keyCode] = false;
			this.trigger("keyUp", [{ key: e.key, keyCode: e.keyCode }]); // TO-DO: Remove
		});

		document.addEventListener("mousedown", (e) => {
			this.trigger("mouseDown", [ e ]);
		});

		document.addEventListener("DOMContentLoaded", () => {
			this._canvas = new Canvas("canvas");
			document.body.appendChild(this._canvas.element);

			this._ui = new UI(this._canvas);

			window.dispatchEvent(new Event("resize"));
			this.trigger("ready", [ {}, this._canvas, this._ui ]);
		});
		return this;
	}

	_createMobileControls() {
		if(!this.isMobile) return;

		var getSide = (x) => ((x < window.innerWidth/2) ? "left" : "right");

		// Mobile controls
		nipplejs.create({
			color: 'black',
			maxNumberOfNipples: 2,
			threshold: .75,
			multitouch: true
		}).on("move", (e, nipple) => {
			this._nipples[getSide(nipple.position.x)] = nipple;
		}).on("end", (e, nipple) => {
			var side = getSide(nipple.position.x);

			if(side in this._nipples)
				delete this._nipples[side];
		});
	}
}
