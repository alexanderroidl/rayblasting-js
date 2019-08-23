//=========================
// Dependencies
//=========================
// Core
var path = 			require('path');

// Gulp
var gulp = 			require('gulp');
var sourcemaps = 	require('gulp-sourcemaps');
var concat = 		require('gulp-concat');
var gulpif =		require('gulp-if');
var babel = 		require('gulp-babel');
var sass = 			require('gulp-sass');
var csso = 			require('gulp-csso');
var autoprefixer = 	require('gulp-autoprefixer');
var uglify = 		require('gulp-uglify');


//=========================
// Configuration
//=========================
var cfg = 			require('./gulp.cfg.js');


//=========================
// Tasks
//=========================
gulp.task('js', () => {
	var files = [];

	cfg.js.input.files.forEach((file) => {
		files.push(path.join(cfg.js.input.dir, file));
	});

	var stream =
		gulp.src(files)
			.pipe(sourcemaps.init())
			.pipe(babel({
	            presets: ['@babel/env']
	        }))
			.on('error', console.error.bind(console))
			.pipe(concat(cfg.js.output.file))
			.pipe(gulpif(cfg.js.output.minify, uglify()))
			.pipe(gulpif(cfg.js.output.sourceMap, sourcemaps.write()))
			.pipe(gulp.dest(cfg.js.output.dir));
});

gulp.task('sass', () => {
	gulp.src(path.join(cfg.sass.input.dir, cfg.sass.pattern))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.on('error', console.error.bind(console))
    .pipe(autoprefixer({
			overrideBrowserslist: cfg.sass.output.autoPrefixerBrowsers
		}))
		.pipe(gulpif(cfg.sass.output.minify, csso()))
		.pipe(gulpif(cfg.sass.output.sourceMap, sourcemaps.write()))
		.pipe(gulp.dest(cfg.sass.output.dir));
});

gulp.task('static', () => {
	gulp.src(path.join(cfg.static.input, cfg.static.pattern))
    	.pipe(gulp.dest(cfg.static.output));
})

gulp.task('watch', function () {
	gulp.watch(path.join(cfg.js.input.dir, cfg.js.pattern), ['js']);
	gulp.watch(path.join(cfg.sass.input.dir, cfg.sass.pattern), ['sass']);
	gulp.watch(path.join(cfg.static.input, cfg.static.pattern), ['static']);
})

gulp.task('default', [ 'js', 'sass', 'static' ]);
