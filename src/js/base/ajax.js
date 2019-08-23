class Ajax {
	constructor(url, method, onLoad) {
		var req = new XMLHttpRequest();

		req.onload = (e) => {
			if(typeof onLoad === "function")
				onLoad.call(null, e.target);
		};

		req.open(method, url, true);
		req.send();
	}
}
