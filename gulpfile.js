'use strict'

var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var sourcemaps = require('gulp-sourcemaps')
var chalk = require('chalk')
var assign = require('lodash.assign')

var gulp = require('gulp')
var gulpif = require('gulp-if')
var inline = require('gulp-inline')
var jade = require('gulp-jade')
var gutil = require('gulp-util')
var concat = require('gulp-concat')
var watch = require('gulp-watch')
var stylus = require('gulp-stylus')
var nib = require('nib')
var rename = require('gulp-rename')
var uglify = require('gulp-uglify')
var streamify = require('gulp-streamify')
var autoprefixer = require('gulp-autoprefixer')

var watchify = require('watchify')
var browserify = require('browserify')
var babelify = require('babelify')

var webserver = require('gulp-webserver')

var production = true

var path = {
  HTML: 'app/index.jade',
  CSS: 'app/**/*.styl',
  ENTRY_POINT: 'app/index.js',
  DEST: 'dist',
  OUT: 'build.js'
}

gulp.task('html', function () {
  gulp.src(path.HTML)
    .pipe(jade({ }))
    .pipe(gulpif(production, inline({ base: 'dist' })))
    .pipe(gulp.dest(path.DEST))
})

gulp.task('css', function () {
  return gulp.src(path.CSS)
    .pipe(sourcemaps.init())
    .pipe(stylus({ use: nib(), import: ['nib'] }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(concat('build.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.DEST))
})

function mapError (err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name) +
      ': ' +
      chalk.yellow(err.fileName.replace(__dirname + '/src/js/', '')) +
      ': ' +
      'Line ' +
      chalk.magenta(err.lineNumber) +
      ' & ' +
      'Column ' +
      chalk.magenta(err.columnNumber || err.column) +
      ': ' +
      chalk.blue(err.description))
  } else {
    // browserify error
    gutil.log(chalk.red(err.name) +
      ': ' +
      chalk.yellow(err.message))
  }

  this.emit && this.emit('end')
}

gulp.task('js', function () {
  var args = assign(watchify.args, {
    entries: [path.ENTRY_POINT],
    debug: true
  })
  var bundler = watchify(browserify(args).transform(babelify, {
    presets: ['es2015', 'react']
  }))

  bundleJS()
  bundler.on('update', bundleJS)
  bundler.on('time', function (e) {})

  function bundleJS () {
    return bundler.bundle()
      .on('error', mapError)
      .pipe(source(path.OUT))
      .pipe(buffer())
      .pipe(rename(path.OUT))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(gulpif(production, uglify({
        preserveComments: false
      })))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(path.DEST))
  }
})

gulp.task('build', function () {
  browserify({
    entries: [path.ENTRY_POINT],
    transform: [babelify]
  })
    .bundle()
    .pipe(source(path.OUT))
    .pipe(streamify(uglify(path.OUT)))
    .pipe(gulp.dest(path.DEST))
})

gulp.task('production', function () {
  production = true
  init()
})

gulp.task('default', function () {
  watch(path.HTML, function () { gulp.start('html') })
  watch(path.CSS, function () { gulp.start('css') })
  init()
  gulp.start('webserver')
})

gulp.task('webserver', function () {
  gulp.src('dist')
    .pipe(webserver({
      livereload: false,
      https: false,
      // host: '0.0.0.0',
      directoryListing: false,
      open: true,
      fallback: 'index.html'
    }))
})

function init () {
  gulp.start('html')
  gulp.start('css')
  gulp.start('js')
}

