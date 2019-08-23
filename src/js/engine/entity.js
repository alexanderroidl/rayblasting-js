class Entity {
	constructor(type, position, rotation) {
		this._type = type;
		this._position = position;
		this._rotation = rotation ? rotation : new Vector(1, 0);
		this._moveSpeed = 1;
		this._lookSpeed = 1;
	}

	get type() { return this._type; }

	get position() { return this._position; }
	set position(position) { this._position = position; }

	get x() { return this._position.x; }
	get y() { return this._position.y; }

	get rotation()  { return this._rotation; }
	set rotation(rotation) { this._rotation = rotation; }

	get moveSpeed() { return this._moveSpeed; }
	set moveSpeed(moveSpeed) { this._moveSpeed = moveSpeed; }

	get lookSpeed() { return this._lookSpeed; }
	set lookSpeed(lookSpeed) { this._lookSpeed = lookSpeed; }

	move(direction, collisionCallback) {
		var move = new Vector();

		var rot = this._rotation;

		if(direction instanceof Vector) {
			move = (direction.multiply(this._moveSpeed));
			//console.log(move);
		} else switch(direction) {
			case "left": move = rot.rotateDeg2D(90).multiply(-this._moveSpeed); break;
			case "right": move = rot.rotateDeg2D(90).multiply(this._moveSpeed); break;
			case "forwards": move = rot.multiply(this._moveSpeed); break;
			case "backwards": move = rot.multiply(-this._moveSpeed); break;

			default: {
				throw new Error(`Invalid direction "${direction}"`);
			}
		}

		var target = this._position.add(move);

		if(typeof collisionCallback === "function") {
			if(collisionCallback(target))
				this._position = target;
			else return false;
		} else this._position = target;

		return true;
	}

	rotate(direction) {
		var multiplier;

		switch(direction) {
			case "left": multiplier = -1; break;
			case "right": multiplier = 1; break;
			default: throw new Error(`Invalid direction "${direction}"`);
		}

		var rad = this._lookSpeed * multiplier;
		this._rotation = this._rotation.rotate2D(rad);

		return rad;
	}

	distance(entity) {
		return this._position.distance(entity.position);
	}
}
