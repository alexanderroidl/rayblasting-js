module.exports = {
	js: {
		input: {
			dir: "src/js",

			files: [
				"core/mainloop.js",
				"base/excanvas.js",
				"**/*.js",
				"!**/_*.js"
			]
		},
		output: {
			dir: "dist/js",
			file: "rayblasting.js",
			minify: true,
			sourceMap: true
		},
		pattern: "**/*.js"
	},

	sass: {
		input: {
			dir: "src/sass"
		},
		output: {
			dir: "dist/css",
			minify: true,
			sourceMap: true,
			autoPrefixerBrowsers: [
				'last 2 versions',
				'ie >= 8',
				'Android >= 2.3',
				'ChromeAndroid > 20',
				'FirefoxAndroid > 20',
				'iOS >= 8'
			]
		},
		pattern: "**/*.scss"

	},

	static: {
		input: "src/static",
		output: "dist",
		pattern: "**/*"
	}
}
