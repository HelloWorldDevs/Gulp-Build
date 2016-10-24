const gulp = require('gulp'),
      sass = require('gulp-sass');

gulp.task('sass', function(){
   return gulp.src('site/scss/**/*.+(scss|sass)')    // Did not use globbing to make faster
       .pipe(sass())                                     // Converts styles.scss and styles.css to css
       .pipe(gulp.dest('site/css'));
});

gulp.task('watch', function(){
   return gulp.watch('site/scss/**/*.+(scss|sass)', ['sass']);
})