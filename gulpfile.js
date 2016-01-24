'use strict'

const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const chalk = require('chalk')
const assign = require('lodash.assign')

const gulp = require('gulp')
const gulpif = require('gulp-if')
const inline = require('gulp-inline')
const jade = require('gulp-jade')
const gutil = require('gulp-util')
const concat = require('gulp-concat')
const watch = require('gulp-watch')
const stylus = require('gulp-stylus')
const nib = require('nib')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const streamify = require('gulp-streamify')
const autoprefixer = require('gulp-autoprefixer')
const importCss = require('gulp-import-css')

const watchify = require('watchify')
const browserify = require('browserify')
const babelify = require('babelify')

const webserver = require('gulp-webserver')

let production = true

const path = {
  HTML: 'app/index.jade',
  CSS: 'app/**/*.styl',
  ENTRY_POINT: 'app/index.js',
  DEST: 'dist',
  OUT: 'build.js'
}

gulp.task('html', () => {
  gulp.src(path.HTML)
    .pipe(jade({ }))
    .pipe(gulpif(production, inline({ base: 'dist' })))
    .pipe(gulp.dest(path.DEST))
})

gulp.task('css', () => {
  return gulp.src(path.CSS)
    .pipe(sourcemaps.init())
    .pipe(stylus({ use: nib(), import: ['nib'] }))
    .pipe(autoprefixer({
      browsers: ['last 1 version'],
      cascade: false
    }))
    .pipe(concat('build.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(importCss())
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

gulp.task('js', () => {
  const args = assign(watchify.args, {
    entries: [path.ENTRY_POINT],
    debug: true
  })
  const bundler = watchify(browserify(args).transform(babelify, {
    presets: ['es2015', 'react']
  }))

  bundleJS()
  bundler.on('update', bundleJS)
  bundler.on('time', e => `JS bundle time: ${console.log(e)}`)
  bundler.on('postbundle', e => console.log(e))

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

gulp.task('build', () => {
  browserify({
    entries: [path.ENTRY_POINT],
    transform: [babelify]
  })
    .bundle()
    .pipe(source(path.OUT))
    .pipe(streamify(uglify(path.OUT)))
    .pipe(gulp.dest(path.DEST))
})

gulp.task('production', () => {
  production = true
  init()
})

gulp.task('default', () => {
  watch(path.HTML, () => gulp.start('html'))
  watch(path.CSS, () => gulp.start('css'))
  init()
  gulp.start('webserver')
})

gulp.task('webserver', () => {
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

