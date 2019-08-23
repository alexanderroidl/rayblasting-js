class Rayblasting {
	constructor() {
		this._state = "init";

		this._game = null;
		this._canvas = null;

		this._assets = {
			images: {
				technokatze: [
					"assets/img/technokatze.jpeg",
					{
						width: 300,
						height: 200
					}
				],
				test: "assets/2.jpg",
				custom: "assets/img/customizer.png",
				bronson: "assets/img/bronson.jpg",
				screen: "assets/img/screen.png"
			}
		};

		this._browser =
			new Browser("Rayblasting")
				.on("ready", (e, canvas, ui) => {
					this._state = "loading";

					this._game = new Game();
					this._canvas = canvas;

					this._load(ui);
				});
	}

	_load(ui) {
		var _totalFileSize, fileSizeLoaded = 0;

		var loader =
			new Loader(this._assets).on({
				"ready": (e, totalFileSize) => {
					_totalFileSize = totalFileSize; // Save filesize to calculate with it
				},

				"update": (e, singleFileSize) => {
					fileSizeLoaded += singleFileSize; // Save progress
					ui.setLoadingProgress(fileSizeLoaded / _totalFileSize); // Deliver made progress as ratio between 0 and 1
				},

				"finish": (e, assets) => {
					// Wait for animations to complete
					window.setTimeout(() => {
						ui.hideLoadingBar();

						// Once more wait for animations to complete
						window.setTimeout(() => this._initialize(assets), 1000);
					}, 500);
				}
			});
	}

	_initialize(assets) {
		// Hide loading bar
		window.setTimeout(() => {
			this._browser
				.ui
				.hideLoadingBar();
		}, 1000);

		// Load assets
		this._state = "level-loading";

		this._game.setAssets(assets)
		this._game.init()
		this._game.on({
				"loadUpdate": (progress) => {
					this._browser
						.ui
						.setBoardLoadingProgress(progress);
				},
				"loadFinish": () => {
					setTimeout(() => {
						this._browser
							.ui
							.hideBoardLoadingBar();

						this._state = "level-ready";
						this._initialized();
					}, 1000);
				}
			});

		// Controls
		this._browser.on({
			mouseDown: (e) => {
				//console.log("mouseDown", e);
			},

			keyDown: (e) => {
				//console.log("keyDown", e)
			}
		});
	}

	_initialized() {
		this._browser.canvas.updateSize();

		MainLoop
			.setUpdate((delta) => {
				this._game.update(delta, this._browser.keyStates, this._browser.nipples);
			})
			.setDraw(() => {
				if(this._canvas != null)
					this._game.draw(this._canvas.context, this._canvas.virtualSize);
			})
			.setEnd((fps, panic) => {
				this._browser.ui.fps = (0.5 + fps) << 0;
				
				if (panic) {
						var discardedTime = (0.5 + MainLoop.resetFrameDelta()) << 0;
						console.warn(`Main loop panicked, probably because the browser tab was put in the background. Discarding ${discardedTime}ms`);
				}
			})
			.start();
	}

	static start() {
		new Rayblasting();
	}
}
