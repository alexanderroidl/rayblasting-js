class EventCollection {
	constructor() {
		this._events = [];
	}

	on(nameOrObject, callback) {
		if(typeof nameOrObject === "object") {
			var objects = nameOrObject;
			for(var object in objects)
				this.on(object, objects[object]);
		} else {
			if(typeof callback !== "function")
				 return false;

			 this._events[nameOrObject] = callback;
		}
		return this;
	}

	trigger(name, args) {
		if(name in this._events)
			this._events[name].apply(this, args);
		return this;
	}
}
