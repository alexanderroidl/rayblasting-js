class Util {
	static isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	static toRadians(degrees) {
		return degrees * (Math.PI / 180);
	}

	static hexToRgb(hex) {
		hex = hex.replace('#', '');
	    var bigint = parseInt(hex, 16);
	    return {
			r: ((bigint >> 16) & 255),
			g: (bigint >> 8) & 255,
			b: (bigint & 255)
		};
	}
}
