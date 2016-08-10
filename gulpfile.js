var gulp = require('gulp');
var browserSync = require('browser-sync')
    .create();
var autoprefixer = require('gulp-autoprefixer');
var changed = require('gulp-changed');
var clean = require('gulp-clean');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var filesize = require('gulp-filesize');
var htmlmin = require('gulp-htmlmin');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var LIBS_CSS = [
  'src/styles/bootstrap-material-design.css',
  'src/styles/bootstrap-material-design.min.css',
  'src/styles/bootstrap-theme.css',
  'src/styles/bootstrap-theme.min.css',
  'src/styles/bootstrap.css',
  'src/styles/bootstrap.min.css',
  'src/styles/ripples.css',
  'src/styles/ripples.min.css'
];
var MY_CSS = [
  'src/styles/dashboard.css',
  'src/styles/general.css',
  'src/styles/login.css',
  'src/styles/notifications.css',
  'src/styles/numbers.css',
  'src/styles/register.css',
  'src/styles/register_form.css'
];
gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
});
gulp.task('clean', function () {
  return gulp.src('dist', {
        read: false
      })
      .pipe(clean());
});
gulp.task('copyHTML', function () {
  gulp.src('src/htmls/*.html')
      .pipe(htmlmin({
      }))
      .pipe(gulp.dest('dist'));
});
gulp.task('copyImage', function () {
  gulp.src('src/img/**/*')
      .pipe(gulp.dest('dist/img/'));
});
gulp.task('copyLibCSS', function () {
  gulp.src(LIBS_CSS)
      .pipe(gulp.dest('dist/styles/'));
});
gulp.task('copyMyCSS', function () {
  gulp.src(MY_CSS)
      .pipe(cleanCSS({
        compatibility: 'ie9'
      }))
      .pipe(autoprefixer({
        browsers: ['IE > 8', 'iOS > 7', 'Firefox > 20', '> 5%'],
        cascade: false
      }))
      .pipe(gulp.dest('dist/styles/'));
});
gulp.task('copyJavaScript', function () {
  gulp.src('src/scripts/**/*')
      .pipe(gulp.dest('dist/scripts/'));
});
gulp.task('concat_js_libs_dev', function () {
  return gulp.src([
        'node_modules/bluebird/js/browser/bluebird.min.js',
        'node_modules/vue/dist/vue.min.js'])
      .pipe(changed('dist/scripts/', {
        extension: '.js'
      }))
      .pipe(concat('libs_bluebird_vue.js'))
      .pipe(gulp.dest('dist/scripts/'));
});
gulp.task('concat_css_dev', function () {
  return gulp.src([
        'src/styles/general.css'
      ])
      .pipe(sourcemaps.init())
      .pipe(concat('all.css'))
      .pipe(cleanCSS({
        compatibility: 'ie9'
      }))
      .pipe(autoprefixer({
        browsers: ['IE > 8', 'iOS > 7', 'Firefox > 20', '> 5%'],
        cascade: false
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist/styles/'))
      .pipe(browserSync.reload({
        stream: true
      }));
});
// 与内页共用JS部分
gulp.task('concat_js_libs_public_prod', function () {
  return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/bootstrap-material-design/dist/js/material.min.js', 'node_modules/bootstrap-dialog/dist/js/bootstrap-dialog.min.js', 'node_modules/bootstrap-material-design/dist/js/ripples.min.js'])
      .pipe(changed('dist/scripts/', {
        extension: '.js'
      }))
      .pipe(concat('jquery_bootstrap_material_bootstrapDialog.js'))
      .pipe(filesize())
      .pipe(gulp.dest('dist/scripts/'));
});
// 与内页共用CSS部分
gulp.task('concat_css_libs_public_prod', function () {
  return gulp.src(['node_modules/normalize.css/normalize.css',
        'src/styles/bootstrap.min.css',
        'src/styles/bootstrap-material-design.css',
        'node_modules/bootstrap-dialog/dist/css/bootstrap-dialog.min.css',
        'src/styles/ripples.css'])
      .pipe(concat('normalize_bootstrap_material_dialog.css'))
      .pipe(gulp.dest('dist/styles/'));
});
gulp.task('dev', ['copyImage', 'copyHTML', 'copyMyCSS', 'copyLibCSS', 'copyJavaScript', 'concat_css_dev'], function () {
  console.log('开发版编译完成');
});
gulp.task('watch_dev', ['browserSync'], function () {
  gulp.watch('src/**/*', ['dev']);
  gulp.watch("dist/**/*").on('change', browserSync.reload);
});