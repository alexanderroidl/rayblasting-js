class Player extends Entity {
	constructor(x, y) {
		super("player", new Vector(x, y));

		this.moveSpeed = 0.05;
		this.lookSpeed = 0.02;
		this.cameraPlane = new Vector(0, 0.66);
	}

	rotate(direction) {
		var rad = super.rotate(direction);
		this.cameraPlane = this.cameraPlane.rotate2D(rad);
	}
}
