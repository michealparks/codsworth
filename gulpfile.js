'use strict'

var source       = require('vinyl-source-stream'),
    buffer       = require('vinyl-buffer'),
    sourcemaps   = require('gulp-sourcemaps'),
    chalk        = require('chalk'),
    assign       = require('lodash.assign'),

    gulp         = require('gulp'),
    plumber      = require('gulp-plumber'),
    gutil        = require('gulp-util'),
    concat       = require('gulp-concat'),
    watch        = require('gulp-watch'),
    stylus       = require('gulp-stylus'),
    rename       = require('gulp-rename'),
    uglify       = require('gulp-uglify'),
    htmlreplace  = require('gulp-html-replace'),
    streamify    = require('gulp-streamify'),
    autoprefixer = require('gulp-autoprefixer'),

    watchify     = require('watchify'),
    browserify   = require('browserify'),
    babelify     = require('babelify'),

    path = {
      HTML         : 'app/index.html',
      CSS          : 'app/**/*.styl',
      ENTRY_POINT  : 'app/index.js',
      DEST         : 'dist',
      OUT          : 'build.js'
    }

gulp.task('html', function() {
  return gulp.src(path.HTML)
    .pipe(gulp.dest(path.DEST))
    
})

gulp.task('css', function() {
  return gulp.src(path.CSS)
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(concat('build.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.DEST))
})

function mapError(err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description))
  } else {
    // browserify error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message))
  }

  // this && this.end()
}

gulp.task('js', function() {
  var args = assign(watchify.args, { 
    entries: [path.ENTRY_POINT],
    debug: true
  })
  var bundler = watchify(browserify(args).transform(babelify, { 
    /* opts */ 
  }))

  bundleJS()
  bundler.on('update', bundleJS)
  bundler.on('time', function(e) {})

  function bundleJS() {
    return bundler.bundle()
      .on('error', mapError)
      .pipe(source(path.OUT))
      .pipe(buffer())
      .pipe(rename(path.OUT))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(path.DEST))
  }
})

gulp.task('build', function(){
  browserify({
    entries: [path.ENTRY_POINT],
    transform: [babelify]
  })
    .bundle()
    .pipe(source(path.OUT))
    .pipe(streamify(uglify(path.OUT)))
    .pipe(gulp.dest(path.DEST))
})

gulp.task('replaceHTML', function(){
  gulp.src(path.HTML)
    .pipe(htmlreplace({
      'js': 'build/' + path.OUT
    }))
    .pipe(gulp.dest(path.DEST))
})

gulp.task('production', ['replaceHTML', 'build'])

gulp.task('default', function() {
  watch(path.HTML, function() { gulp.start('html') })
  watch(path.CSS, function() { gulp.start('css') })

  gulp.start('html')
  gulp.start('css')
  gulp.start('js')
}) 
// ['html', 'css', 'js'])

