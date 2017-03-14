var config = require('./../config.json'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    gulpIf = require('gulp-if'),
    cssnano = require('gulp-cssnano'),
    inject = require('gulp-inject-string'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    htmlhint = require("gulp-htmlhint"),
    jshint = require('gulp-jshint'),
    // checkCSS = require( 'gulp-check-unused-css' ),
    spritesmith = require('gulp.spritesmith');

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './'
        },
    })
});

gulp.task('sprite', function () { // Sprites PNG files placed in images/sprite folder
    // Deletes current sprite CSS stylesheet and sprite image file.
    del.sync('./css/sprite.css');
    del.sync('./images/sprite.png');

    // Generate our spritesheet for png files
    var spriteData = gulp.src('./images/sprite/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css'
    }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('./css')); // Destination for sprite.png
    var cssStream = spriteData.css
        .pipe(gulp.dest('./css')); // Destination for sprite.css
    // Automatically links to sprite.css in index.html by inserting this snippet.
    gulp.src('./index.html')
        .pipe(inject.before('<!--endbuild-->', '<link rel="stylesheet" href="css/sprite.css">'))
        .pipe(gulp.dest('./'));
    gulp.src('./css/*.png')
        .pipe(gulp.dest(config.build + '/css')); // Places sprite images into build folder.
});

gulp.task('sass', function() { // Sass compiler.
    return gulp.src('./scss/main.scss')
        .pipe(sass())               // Converts Sass to CSS with gulp-sass.
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('autoprefix', function () { // Auto-prefixes css for flexbox.
    var postcss      = require('gulp-postcss'); // This task will not work if these 3 variables are ran outside of this task.
    var sourcemaps   = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer');

    return gulp.src('./css/main.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(sourcemaps.write('.')) // Creates a sourcemap of the CSS in main.css.map.
        .pipe(gulp.dest('./css'));
});

gulp.task('sass-autoprefix', function() { // Runs sass and autoprefixer in sequence.
    runSequence('sass', 'autoprefix');
});


gulp.task('useref', function() {     // Useref is used for concatinating between two snippets in index.html file.
    return gulp.src('./*.html')
    // Concats JS files & CSS Files in between snippets in index.html
        .pipe(useref())
        // Minifies only if a JS file
        .pipe(gulpIf('*.js', uglify()))
        //Minifies only if a CSS file
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(inject.before('<script src="js/main.min.js"></script>', config.snippets.scriptTag)) // Inserts snippet before JS tag.
        .pipe(inject.before('<link rel="stylesheet" href="css/styles.min.css">', config.snippets.cssTag)) // Inserts snippet before CSS tag.
        .pipe(gulp.dest(config.build));
});

gulp.task('images', function() {        // Compresses all images.
    gulp.src('./images/**/*.+(jpeg|jpg|gif|svg|png|pdf)')
        .pipe(cache(imagemin({          // Caching checks if already compressed. If so, skips image.
            interlaced: true
        })))
        .pipe(gulp.dest(config.build + '/images'));    // Moves all images to distribution.
});

gulp.task('fonts', function() { // Moves all font files over to dist
    gulp.src('./fonts/**/*')
        .pipe(gulp.dest(config.build + 'fonts'));
    return gulp.src('./css/fonts/**/*') // We do this also because the canvas template has fonts located in the css folder.
        .pipe(gulp.dest(config.build + 'css/fonts'));
});

gulp.task('html-lint', function () { // HTML linter
    gulp.src('./*.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter('htmlhint-stylish')) // Makes validation error messages more verbose.
        .pipe(htmlhint.failReporter({ suppress: true })); // Errors out on html validation errors.
});

gulp.task('js-lint', function() { // JS Linter
    return gulp.src('./js/custom.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default', { verbose: true })) // Makes JS error messages more verbose. Can change to 'jshint-stylish.'
        .pipe(jshint.reporter('fail')); // Task stops if JS error.
});

gulp.task('validate', function() {
    // This task runs html-lint first. If there's a HTML validation error, won't get to js-lint.
    runSequence('html-lint', 'js-lint');
})

gulp.task('clean:dist', function() { // Deletes distribution folder.
    return del.sync(config.build, {force:true});
});

gulp.task('watch', ['browserSync', 'sass-autoprefix'], function(){
    gulp.watch('./scss/**/*.scss', ['sass-autoprefix']);
    gulp.watch('./*.html', browserSync.reload);
    gulp.watch('./js/**/*.js', browserSync.reload);
    gulp.watch('./images/**/*.+(jpg|gif|svg|jpeg|png|pdf)', ['images']);
    // gulp.watch('./images/sprite/*.png', ['sprite']);
    gulp.watch('./images/**/*.+(jpg|gif|svg|jpeg|png|pdf)', browserSync.reload);

    // Other watchers
});

gulp.task('build', function (callback) {
    // Placed task 'useref' at end to ensure that sass-autoprefix will run first. To enable spriting, add in 'sprite' task.
    // Will error out if HTML validation or JS errors. To stop, remove 'validate' task.
    runSequence('clean:dist', 'validate', 'sass-autoprefix', ['images', 'fonts'], 'useref',
        callback
    );
});

gulp.task('default', function (callback) {
    runSequence(['sass-autoprefix', 'browserSync', 'watch'],
        callback
    );
});


// gulp.task('uncss', function() { //Not Tested
//     gulp.src([ './main.css', './*.html' ])
//         .pipe( checkCSS() );
// })

