const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync');

gulp.task('browserSync', function() {
   browserSync.init({
      server: {
         baseDir: 'site'
      },
   })
});

gulp.task('sass', function(){
   return gulp.src('site/scss/**/*.+(scss|sass)')
       .pipe(sass())                                     // Converts scss to css
       .pipe(gulp.dest('site/css'))
       .pipe(browserSync.reload({
          stream: true
       }));
});

gulp.task('watch', ['sass', 'browserSync'], function(){           // Runs both browsersync and sass concurrently
   return gulp.watch('site/scss/**/*.+(scss|sass)', ['sass']);
});