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
      spritesmith = require('gulp.spritesmith'),
      merge = require('merge-stream'),
      htmlhint = require('gulp-htmlhint'),
      prompt = require('gulp-prompt'),
      rename = require('gulp-rename');



/********* Snippets ***********/

const snippets = {
    scriptTag: "<!-- Scripts -->\n\t",
    cssTag: "<!-- CSS -->\n\t",
    index: "test"
}


/******* Tasks **********/
gulp.task('browserSync', function() { // Initiate BrowserSync
   browserSync.init({
      server: {
         baseDir: 'site'
      },
   })
});

gulp.task('sass', function(){
   return gulp.src('site/scss/main.scss')   // Converts main.scss to css file for dev process
       .pipe(sass())
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

gulp.task('images', function() {        // Compresses all images except PNG's.
    gulp.src('site/images/**/*.+(jpeg|jpg|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'));    // Moves all images except for PNG's                                                                  // PNG's will be compressed during Sprite Process
});

gulp.task('fonts', function() { // Moves all font files over to dist
    gulp.src('site/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));
    return gulp.src('site/css/fonts/**/*')
        .pipe(gulp.dest('dist/css/fonts'));
});

gulp.task('clean:dist', function() { // Completely deletes dist folder
    return del.sync('dist');
});


gulp.task('cache:clear', function(callback) { // Clears cache of project
    return cache.clearAll(callback)
});


gulp.task('sprite', function () {
    gulp.src('site/images/*.+(png)')      // Compress all PNG files
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('site/images'));
    // Generate our spritesheet for png files
    var spriteData = gulp.src('site/images/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.scss'
    }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('site/images/sprite'), ('dist/images/sprite'))
        .pipe(gulp.dest('dist/images/sprite')); // Destination for sprite PNG
    var cssStream = spriteData.css
        .pipe(gulp.dest('site/dependencies/scss')); // Destination for sprite.scss
});

gulp.task('watch', ['sass', 'browserSync'], function(){           // Runs both browsersync and sass concurrently
    gulp.watch('site/scss/**/*.+(scss|sass)', ['sass']);
    gulp.watch('site/images/**/*.+(jpg|gif|svg|jpeg)', ['images']);
    gulp.watch('site/*.html', browserSync.reload);
    gulp.watch('site/js/**/*.js', browserSync.reload);
    gulp.watch('site/images/*.png', ['sprite']);
});

gulp.task('valid', function () {
    gulp.src('site/index.html')
        .pipe(htmlhint())
        .pipe(htmlhint.reporter());
});

gulp.task('start', function() {
    gulp.src('site/index.html')
        .pipe(prompt.prompt({
            type: 'input',
            name: 'answer',
            message: 'Do you want to start a new project?',
            validate: function(answer){
                if(answer === 'yes'){
                    del.sync('site/index.html');
                    console.log('\nBuilding new project...');

                    gulp.src('template-index.html')
                        .pipe(rename('index.html'))
                        .pipe(gulp.dest('site/'));
                } else if (answer === 'no') {
                    console.log('\nA new project was not created.');
                }
            }
        }, function(res){
            //value is in res.pass
        }));
});


gulp.task('build', function (callback) {
    runSequence('clean:dist', 'sass', ['valid', 'useref', 'images', 'sprite', 'fonts'],
        callback
    );
});

gulp.task('default', function (callback) {
    runSequence(['sass', 'valid', 'browserSync', 'watch'],
        callback
    );
});


