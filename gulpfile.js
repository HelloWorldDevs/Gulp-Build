const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync'),
      useref = require('gulp-useref'),
      uglify = require('gulp-uglify'),
      gulpIf = require('gulp-if'),
      cssnano = require('gulp-cssnano'),
      imagemin = require('gulp-imagemin'),
      cache = require('gulp-cache');

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
        .pipe(gulp.dest('dist'));
});

gulp.task('imagemin', function() {            // Compresses all images.
    return gulp.src('site/images/**/*.+(jpeg|jpg|png|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('site/images'));
});

gulp.task('fonts', function() {
    gulp.src('site/fonts/**/*')
})

gulp.task('watch', ['sass', 'browserSync'], function(){           // Runs both browsersync and sass concurrently
    gulp.watch('site/scss/**/*.+(scss|sass)', ['sass']);
    gulp.watch('site/images/**/*.+(png|jpg|gif|svg|jpeg)', ['imagemin']);
    gulp.watch('site/*.html', browserSync.reload);
    gulp.watch('site/js/**/*.js', browserSync.reload);
});