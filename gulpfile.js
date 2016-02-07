'use strict'

const assign = require('lodash.assign')
const autoprefixer = require('gulp-autoprefixer')
const babelify = require('babelify')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const chalk = require('chalk')
const concat = require('gulp-concat')
const cssnano = require('gulp-cssnano')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const gulpUtil = require('gulp-util')
const importCss = require('gulp-import-css')
const inline = require('gulp-inline')
const jade = require('gulp-jade')
const nib = require('nib')
const rename = require('gulp-rename')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')
const streamify = require('gulp-streamify')
const stylus = require('gulp-stylus')
const uglify = require('gulp-uglify')
const watch = require('gulp-watch')
const watchify = require('watchify')
const webserver = require('gulp-webserver')

const path = {
  HTML: 'app/index.jade',
  CSS: 'app/**/*.styl',
  ENTRY_POINT: 'app/index.js',
  DEST: 'dist',
  OUT: 'build.js'
}

const args = assign(watchify.args, {
  entries: [path.ENTRY_POINT],
  debug: true
})

const bundler = watchify(browserify(args).transform(babelify, {
  presets: ['es2015', 'react']
}))

let production = process.argv[2] === 'prod'

bundler
  .on('update', bundleJS)
  .on('time', e => `JS bundle time: ${console.log(e)}`)
  .on('postbundle', e => console.log(e))
  .on('error', mapError)

function bundleJS () {
  return bundler.bundle()
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

function mapError (err) {
  if (err.fileName) {
    // regular error
    gulpUtil.log(chalk.red(err.name) +
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
    gulpUtil.log(chalk.red(err.name) +
      ': ' +
      chalk.yellow(err.message))
  }

  this.emit && this.emit('end')
}

gulp.task('html', () => gulp.src(path.HTML)
  .pipe(jade({ }))
  .pipe(gulpif(production, inline({ base: 'dist' })))
  .pipe(gulp.dest(path.DEST))
)

gulp.task('css', () => gulp.src(path.CSS)
  .pipe(gulpif(!production, sourcemaps.init()))
  .pipe(stylus({
    use: nib(),
    import: ['nib', `${__dirname}/app/vars.styl`],
    compress: true
  }))
  .pipe(autoprefixer({
    browsers: ['last 1 version'],
    cascade: false
  }))
  .pipe(concat('build.css'))
  .pipe(importCss())
  .pipe(gulpif(production, cssnano()))
  .pipe(gulpif(!production, sourcemaps.write()))
  .pipe(gulp.dest(path.DEST))
)

gulp.task('watchJS', () => bundleJS())

gulp.task('buildJS', () =>
  browserify({
    entries: [path.ENTRY_POINT]
  })
  .transform(babelify, { presets: ['es2015', 'react'] })
  .bundle()
  .pipe(source(path.OUT))
  .pipe(streamify(uglify(path.OUT)))
  .pipe(gulp.dest(path.DEST))
)

gulp.task('webserver', () => gulp.src('dist')
  .pipe(webserver({
    livereload: false,
    https: false,
    host: '0.0.0.0',
    directoryListing: false,
    open: true,
    fallback: 'index.html'
  }))
)

gulp.task('prod', ['html', 'css', 'buildJS'])

gulp.task('default', ['html', 'css', 'watchJS'], () => {
  watch(path.HTML, () => gulp.start('html'))
  watch(path.CSS, () => gulp.start('css'))
  return gulp.start('webserver')
})
