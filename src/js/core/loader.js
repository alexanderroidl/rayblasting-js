class Loader extends EventCollection {
	constructor(files) {
		super();

		this._files = files;
		this.run();
	}

	_getFilesInfo(onReady) {
		var files = this._files, invalidFiles = [];
		var count = 0;
		var totalSize = 0, info = {}, validFilesCount = 0;

		function beforeReady() {
			// Calculate size for invalid items
			if(invalidFiles.length > 0 && validFilesCount) {
				var averageSize = totalSize / validFilesCount;

				for(var fileName in invalidFiles) {
					var file = invalidFiles[fileName];
					if(file.parent)
						info[file.parent][file.name].size = averageSize;
					else info[file.name].size = averageSize;
				}
				totalSize += invalidFiles.length * averageSize;
			}
			onReady.call(null, totalSize, info);
		}

		(function iterate(files, parent) {
			for(var fileName in files) {
				var fileSource = files[fileName],
					fileData = {};

				if(Array.isArray(fileSource)) {
					if(!fileSource.length || typeof fileSource[0] !== "string")
						continue;

					if(typeof fileSource[1] === "object")
						fileData = fileSource[1];

					fileSource = fileSource[0];
				} else if(typeof fileSource === "object") {
					if(!parent) iterate(fileSource, fileName);
					continue;
				}
				count++;

				File.getSize(fileSource, (size, store) => {
					var infoObject = {
						src: store.src,
						size: size,
						data: store.data
					};

					if(store.parent) {
						if(!info[store.parent]) info[store.parent] = [];
						info[store.parent][store.name] = infoObject;
					} else info[store.name] = infoObject;

					totalSize += size;

					if(!size) invalidFiles.push(store);
					else validFilesCount++;

					if(!(--count))
						beforeReady();
				}, {
					name: fileName,
					parent: parent,
					src: fileSource,
					data: fileData
				});
			}
		}(files));

		return true;
	}

	_loadFilesByInfo(info, onUpdate, onFinish) {
		var loader = this;
		var count = 0, objects = [];

		function update(size) {
			if(typeof onUpdate === "function")
				onUpdate.call(null, size);

			if(!(--count))
				onFinish.call(null, objects);
		}

		(function iterate(info, parent) {
			for(var name in info) {
				if(Array.isArray(info[name]) ||
				  (typeof info[name] === "object" && !info[name].src)) {
					if(!parent) iterate(info[name], name);
					continue;
				}
				count++;

				var fileData = info[name].data,
					fileType = File.getType(info[name].src);

				switch(fileType) {
					case "image": {
						var img;

						if(fileData.width && fileData.height)
							img = new Image(fileData.width, fileData.height);
						else img = new Image();

						img.src = info[name].src;
						img.title = name;
						img.parent = parent;

						img.onload = function(e) {
							objects[this.title] = {
								obj: this,
								parent: this.parent
							};
							update(info[this.title].size);
						}

						// Also update using calculated average size to enjoy a smoother loading effect
						img.onerror = function(e) {
							update(info[this.title].size);
						};
						break;
					}
					default: {
						console.warning(`Unknown file extension ${fileType}`);
						update(0);
					}
				}
			}
		}(info));

		return this;
	}

	run() {
		var loader = this;

		this._getFilesInfo((totalSize, info) => {
			var _totalSize = totalSize;
			if(!totalSize) _totalSize = 1;

			this.trigger("ready", [ {}, _totalSize ]);

			loader._loadFilesByInfo(info, (singleFileSize) => {
				if(totalSize)
					this.trigger("update", [ {}, singleFileSize ]);
			}, (objects, error) => {
				if(error) throw new Error("Couldn't load: " + error);

				for(var object in objects) {
					var parent = objects[object].parent,
						obj = objects[object].obj;

					if(parent) info[parent][object].obj = obj;
					else info[object].obj = obj;
				}

				if(!totalSize) this.trigger("update", [ {}, _totalSize ]);
				this.trigger("finish", [ {}, info ]);
			});
		});

		return this;
	}
}
