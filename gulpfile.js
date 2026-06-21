const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const cp = require('child_process');
const browserSync = require('browser-sync').create();

const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

const paths = {
  styles: {
    src: '_scss/**/*.scss',
    dest: '_site/css',
    destsecond: 'css'
  },
  scripts: {
    src: '_js/src/*.js',
    dest: '_site/js/dist/',
    destsecond: 'js/dist/'
  }
};

function jekyllBuild(done) {
  return cp.spawn(jekyll, ['build'], { stdio: 'inherit' });
  done();
}

function style() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      cssnano()
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(gulp.dest(paths.styles.destsecond))
    .pipe(browserSync.stream());
}

function js() {
  return gulp.src([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    './node_modules/jquery-match-height/dist/jquery.matchHeight-min.js',
    paths.scripts.src
  ])
  .pipe(concat('app.bundle.js'))
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(gulp.dest(paths.scripts.destsecond))
  .pipe(browserSync.stream());
}

function serve(done) {
  browserSync.init({
    server: {
      baseDir: "_site"
    }
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  gulp.watch(paths.styles.src, style);
  gulp.watch(paths.scripts.src, js);

  gulp.watch([
    '*.html',
    '_layouts/**/*.html',
    '_pages/**/*.html',
    '_posts/**/*',
    '_data/**/*',
    '_includes/**/*'
  ], gulp.series(jekyllBuild, reload));
}

exports.build = jekyllBuild;
exports.style = style;
exports.js = js;
exports.serve = serve;
exports.watch = watchFiles;

exports.default = gulp.series(
  jekyllBuild,
  gulp.parallel(serve, watchFiles)
);