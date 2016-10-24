const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync'),
      useref = require('gulp-useref'),
      uglify = require('gulp-uglify'),
      gulpIf = require('gulp-if'),
      cssnano = require('gulp-cssnano'),
      imagemin = require('gul-imagemin');

gulp.task('browserSync', function() {
   browserSync.init({
      server: {
         baseDir: 'site'
      },
   })
});

gulp.task('sass', function(){
   return gulp.src('site/scss/main.scss')
       .pipe(sass().on('error', sass.logError))                                     // Converts scss to css
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

gulp.task('imagemin', function() {
    return gulp.src('site/images/**/*.+(png|jpg|gif|svg|jpeg)')
        .pipe(imagemin({
            interlaced: true
        }))
        .pipe(gulp.dest('site/images'));
});


gulp.task('watch', ['sass', 'browserSync'], function(){           // Runs both browsersync and sass concurrently
    gulp.watch('site/scss/**/*.+(scss|sass)', ['sass']);
    gulp.watch('site/images/**/*.+(png|jpg|gif|svg|jpeg)', ['imagemin']);
    gulp.watch('site/*.html', browserSync.reload);
    gulp.watch('site/js/**/*.js', browserSync.reload);
});