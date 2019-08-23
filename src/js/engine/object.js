class GameObject extends Entity {
	constructor(type, texture, x, y) {
		super("object", new Vector(x, y));

		this._objectType = type;
		this._texture = texture;
	}

	get objectType() { return this._objectType; }
	get texture() { return this._texture; }
}
