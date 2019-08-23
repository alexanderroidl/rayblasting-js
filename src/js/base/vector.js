class Vector {
	constructor(x, y, z) {
		this._x = x ? x : 0;
		this._y = y ? y : 0;
		this._z = z ? z : 0;
	}

	get x() { return this._x; }
	get y() { return this._y; }
	get z() { return this._z; }

	set x(x) { this._x = x; }
	set y(y) { this._y = y; }
	set z(z) { this._z = z; }

	get rad() { return Math.atan2(this.y, this.x); }
	get deg() { return this.rad * 180 / Math.PI; }

	get point() {
		return {
			x: (this.x << 0),
			y: (this.y << 0),
			z: (this.z << 0)
		}
	}

	static scalar(s) {
		return new Vector(s, s, s);
	}

	static fromRad(rad) {
		return new Vector(Math.cos(rad), Math.sin(rad));
	}

	abs(v) {
		return new Vector(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
	}

	add(v) {
		if(Util.isNumeric(v)) v = Vector.scalar(parseFloat(v));
		return new Vector(this.x + v.x, v.y + this.y, v.z + this.z);
	}

	subtract(v) {
		if(Util.isNumeric(v)) v = Vector.scalar(parseFloat(v));
		return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
	}

	multiply(v) {
		if(Util.isNumeric(v)) v = Vector.scalar(parseFloat(v));
		return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
	}

	divide(v) {
		if(Util.isNumeric(v)) v = Vector.scalar(parseFloat(v));
		return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
	}

	rotate2D(n) {
		var x = this.x * Math.cos(n) - this.y * Math.sin(n);
		var y = this.x * Math.sin(n) + this.y * Math.cos(n);

		return new Vector(x, y, this.z);
	}

	rotateDeg2D(deg) {
		return this.rotate2D(Util.toRadians(deg));
	}

	distance(v) {
		return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
	}
}
