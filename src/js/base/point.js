class Point {
	constructor(x, y) {
		this.x = x ? x : 0;
		this.y = y ? y : 0;
	}

	get x() { return this._x; }
	get y() { return this._y; }

	set x(x) { this._x = x << 0; }
	set y(y) { this._y = y << 0; }
}
