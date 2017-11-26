var gulp = require('gulp');
var sass = require('gulp-sass');
var cssnano = require('cssnano');
var browserSync = require('browser-sync');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var glob = require('glob');
var es = require('event-stream');
var flatten = require('gulp-flatten');
var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll website
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll and reload the page
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for the jekyll-build task, then start the server
 */
gulp.task('browser-sync', ['sass','js','jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('_scss/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            outputStyle: 'compressed',
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
});


// Compile and minify Javascript into one bundle file
gulp.task('js', function(done) {
    gulp.src('_js/src/*.js', function(err, files) {
        if(err) done(err);

        var tasks = files.map(function(entry) {
            return browserify({ entries: [entry] })
                .bundle()
                .pipe(source(entry))
                .pipe(rename({
                    extname: '.bundle.js'
                }))
                .pipe(buffer())
                .pipe(uglify())
                .pipe(flatten())
                .pipe(gulp.dest('_site/js/dist/'))
                .pipe(browserSync.reload({stream:true}))
                .pipe(gulp.dest('js/dist/'));
            });
        es.merge(tasks).on('end', done);
    })
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/**/*.scss', ['sass']);
    gulp.watch('_js/**/*.js', ['js']);
    gulp.watch(['*.html', '_layouts/*.html', '_pages/*', '_posts/*', '_data/*', '_includes/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
