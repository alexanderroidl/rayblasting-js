class Game extends EventCollection {
	constructor() {
		super();

		this._assets = {};
		this._level = null;
		this._renderer = new Renderer();
	}

	get level() { return this._level; }

	get isReady() {
		return ((this._level && this._level.player) && !this._paused);
	}

	setAssets(assets) {
		this._assets = assets;
	}

	init() {
		var levelTotalSize, levelSizeLoaded = 0;

		var _level =
			new Level("groundzero")
				.on({
					"ready": (totalFileSize) => {
						levelTotalSize = totalFileSize;
						this.trigger("loadStart");
					},

					"update": (singleFileSize) => {
						levelSizeLoaded += singleFileSize;
						this.trigger("loadUpdate", [ levelSizeLoaded / levelTotalSize ]);
					},

					"finish": () => {
						this._level = _level;
						this._renderer.level = _level;
						this.trigger("loadFinish");
					}
				});
	}

	update(delta, keyStates, nipples) {
		if(!this.isReady) return;

		if(keyStates[87] || keyStates[38]) {
			this._level.movePlayer("forwards");
		}
		if(keyStates[65] || keyStates[37]) {
			this._level.movePlayer("left");
		}
		if(keyStates[83] || keyStates[40]) {
			this._level.movePlayer("backwards");
		}
		if(keyStates[68] || keyStates[39]) {
			this._level.movePlayer("right");
		}

		if(keyStates[81]) { // q
			this._level.rotatePlayer("left");
		}
		if(keyStates[69]) { // e
			this._level.rotatePlayer("right");
		}

		if(nipples["left"]) {
			var nipple = nipples["left"];

			var direction = Vector.fromRad(nipple.angle.radian);
			var rotation = this._level.player.rotation;

			var move = new Vector(direction.x, direction.y * -1);
			move = move.rotateDeg2D(rotation.deg + 90);
			move = move.multiply(nipple.distance / 50)

			this._level.movePlayer(move);
		}

		if(nipples["right"]) {
			var nipple = nipples["right"];

			var direction = Vector.fromRad(nipple.angle.radian);
			this._level.rotatePlayer(direction.x);
		}
	}

	draw(context, size) {
		context.clearRect(0, 0, size.width, size.height);
		this._renderer.run(context, size);
	}
}
