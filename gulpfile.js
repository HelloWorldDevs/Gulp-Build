const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync'),
      useref = require('gulp-useref'),
      uglify = require('gulp-uglify'),
      gulpIf = require('gulp-if'),
      cssnano = require('gulp-cssnano'),
      imagemin = require('gulp-imagemin'),
      cache = require('gulp-cache'),
      del = require('del'),
      runSequence = require('run-sequence'),
      inject = require('gulp-inject-string'),
      spritesmith = require('gulp.spritesmith');

/********* Snippets ***********/
const snippets = {
    scriptTag: "<!--============================ Scripts ============================-->\n\t",
    cssTag: "<!--============================ CSS ============================-->\n\t",
}

/******* Tasks **********/
gulp.task('browserSync', function() {
   browserSync.init({
      server: {
         baseDir: 'site'
      },
   })
});

gulp.task('sass', function(){
   return gulp.src('site/scss/main.scss')
       .pipe(sass())                                     // Converts scss to css
       .pipe(gulp.dest('site/css'))
       .pipe(browserSync.reload({
          stream: true
       }));
});

gulp.task('useref', function() {
    return gulp.src('site/*.html')
        // Concats JS files - No need to concat CSS files
        .pipe(useref())
        // Minifies only if a JS file
        .pipe(gulpIf('*.js', uglify()))
        //Minifies only if a CSS file
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(inject.before('<script src="js/main.min.js"></script>', snippets.scriptTag))
        .pipe(inject.before('<link rel="stylesheet" href="css/styles.min.css">', snippets.cssTag))
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {            // Compresses all images.
    return gulp.src('site/images/**/*.+(jpeg|jpg|png|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
    gulp.src('site/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
    return gulp.src('site/css/fonts/**/*')
        .pipe(gulp.dest('dist/css/fonts'));
});

gulp.task('clean:dist', function() {
    return del.sync('dist');
});


gulp.task('cache:clear', function(callback) { // Clears cache of project
    return cache.clearAll(callback)
});


gulp.task('sprite', function () {
    var spriteData = gulp.src('site/images/**/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css'
    }));
    spriteData.css.pipe(gulp.dest('site/scss'));
    spriteData.img.pipe(gulp.dest('site/images'));
});

gulp.task('watch', ['sass', 'browserSync'], function(){           // Runs both browsersync and sass concurrently
    gulp.watch('site/scss/**/*.+(scss|sass)', ['sass']);
    gulp.watch('site/images/**/*.+(png|jpg|gif|svg|jpeg)', ['images']);
    gulp.watch('site/*.html', browserSync.reload);
    gulp.watch('site/js/**/*.js', browserSync.reload);
});

gulp.task('build', function (callback) {
    runSequence('clean:dist', 'sass', ['useref', 'images', 'fonts'],
        callback
    );
});


gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'],
        callback
    );
});