class File {
	static getExtension(src) {
		return src.split(".").pop();
	}

	static getType(src) {
		var foundType = "unknown";

		switch(this.getExtension(src)) {
			case "png":
			case "jpg":
			case "jpeg":
			case "gif":
			case "svg": {
				foundType = "image";
				break;
			}
		}
		return foundType;
	}

	static getSize(path, onFinish, store) {
		new Ajax("filesize.php?path=" + path, "GET", (e) => {
			var imageSize = e.status == 200 ? parseInt(e.response) : null;

			if(!Number.isInteger(imageSize))
				imageSize = 0;

			onFinish.call(null, imageSize, store);
		});
	}
}
