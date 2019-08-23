class Level extends EventCollection {
	constructor(name) {
		super();

		this._name = name;
		this._grid = new Array(10).fill(new Array(10));
		this._mapSize = null;
		this._player = null;
		this._objects = [];
		this._textures = new TextureFactory();
		this._references = {};

		this._load();
	}

	get player() { return this._player; }
	get textures() { return this._textures; }
	get objects() { return this._objects; }

	set grid(grid) {
		var longestRow = 0;
		for(var y = 0; y < grid.length; y++) {
			if(grid[y].length > longestRow)
				longestRow = grid[y].length;
		}

		this._mapSize = {
			width: grid.length,
			height: longestRow
		};
		this._grid = grid;
	}

	map(x, y) {
		if(x === undefined && y === undefined) return this._grid;
		return (y in this._grid && x in this._grid[y] ? this._grid[y][x] : null);
	}

	collision(target) {
		if(this.map(target.x << 0, target.y << 0))
			return false;
		return true;
	}

	movePlayer(direction) {
		return this._player.move(direction, (target) => {
			return this.collision(target);
		});
	}

	rotatePlayer(direction) {
		return this._player.rotate(direction);
	}

	_start(entityData) {
		for(var entity in entityData) {
			var e = entityData[entity];

			switch(e.type) {
				case "player": {
					this._player = new Player(e.x, e.y);
					break;
				}

				case "object": {
					var texture = this._textures.get(e.data.objectTextureId);
					this._objects.push(new GameObject("static", texture, e.x + 0.5, e.y + 0.5));
					break;
				}
			}
		}

		this.trigger("finish");
	}

	_onLoadingFinished(data, assets) {
		var _entityData = [];

		if(assets.images) {
			for(var assetName in assets.images) {
				var asset = assets.images[assetName];
				if(!asset.obj) continue;

				var textureMap = asset.data.textureMap;
				if(textureMap)
					this._textures.loadMap(asset.obj, textureMap.size, textureMap.transparent, textureMap.gap);
			}
		}

		if(data.references) {
			this._references = data.references;
		}

		if(data.blocks) {
			var _grid = [];

			for(var y = 0; y < data.blocks.length; y++) {
				_grid.push([]);

				for(var x = 0; x < data.blocks[y].length; x++) {
					var block = data.blocks[y][x];
					if(typeof block !== "string") continue;

					_grid[y][x] = block ? this._getBlockStringTextureId(block) : 0;
				}
			}
			this._grid = _grid;
		}

		if(data.entities) {
			for(var y = 0; y < data.entities.length; y++) {
				for(var x = 0; x < data.entities[y].length; x++) {
					var entity = data.entities[y][x];
					if(typeof entity !== "string") continue;

					var entityData = entity.match(/^([a-z])([a-z])?([0-9]{1,3})?$/);
					if(!entityData) continue;

					var type = "unknown", _data = {};

					switch(entityData[1]) {
						case "p": type = "player"; break;
						case "o": {
							if(!(entityData[2] && entityData[3]))
								continue;

							type = "object";

							_data.objectType = entityData[2];
							_data.objectTextureId = this._getObjectIdTextureId(entityData[3]);
						}
					}

					_entityData.push({
						type: type,
						x: x,
						y: y,
						data: _data
					});
				}
			}
		}

		if(data.textureSize)
			this._textures.size = data.textureSize;

		this._start(_entityData);
	}

	_load() {
		new Ajax("level.php?name=" + this._name, "GET", (res) => {
			var data = JSON.parse(res.response);

			if(res.status != 200 || data.error)
				return alert(data.error);

			if(data.assets) {
				var _totalFileSize, _loadedFileSize = 0;

				new Loader(data.assets).on({
					"ready": (e, totalFileSize) => {
						this.trigger("ready", [ totalFileSize ]);
					},
					"update": (e, singleFileSize) => {
						this.trigger("update", [ singleFileSize ]);
					},
					"finish": (e, assets) => {
						this._onLoadingFinished(data, assets);
					}
				});
			}
		});
	}

	_getBlockStringTextureId(blockString) {
		var blockRegExp = /^([a-z]{1,3})?([0-9]{1,3})$/;
		var match = blockString.match(blockRegExp);
		var index = -1;

		if(!match) return -1;

		if(match[2]) {
			var startIndex = 0;

			if(match[1] in this._references.textures) {
				var guide = this._textures.guide(this._references.textures[match[1]]);
				if(guide != null)
					startIndex = guide.start;
			}
			index = parseInt(match[2]);

			if(!isNaN(index)) index += startIndex;
			else index = 0;
		}
		return index;
	}

	_getObjectIdTextureId(objectId) {
		if(objectId in this._references.objectsTextures) {
			var textureReference = this._references.objectsTextures[objectId];
			return this._getBlockStringTextureId(textureReference);
		}
		return -1;
	}
}
