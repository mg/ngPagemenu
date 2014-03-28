'use strict';

var gulp= require('gulp');
require('./conf/gulp/common.js');
require('./conf/gulp/test.js');
require('./conf/gulp/build.js');

var paths = require('./conf/gulp/config.js');

gulp.task('watch', function () { gulp.watch(paths.local.local, ['build']); });
gulp.task('default', ['build']);