/*var ffmpeg = require('ffmpeg');*/
var _ = require('underscore');
var q = require('q');
var FS = require('q-io/fs');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

var puts = function (error, stdout, stderr) {
  'use strict';
  sys.puts(stdout);
};

var sourceDir = process.argv[2];

FS.exists(sourceDir + '/ogv/')
.then(function (exists) {
  'use strict';
  if (!exists) {
    return FS.makeDirectory(sourceDir + '/ogv/').then(FS.exists(sourceDir + '/wmv/'));
  }
  else {
    return FS.exists(sourceDir + '/wmv/');
  }
})
.then(function (exists) {
  'use strict';
  if (!exists) {
    return FS.makeDirectory(sourceDir + '/wmv/').then(FS.exists(FS.list(sourceDir + '/mov/')));
  }
  else {
    return FS.list(sourceDir + '/mov/');
  }
})
.then(FS.list(sourceDir + '/mov/'))
.then(function (list) {
  'use strict';
  var count = 0;

  var convert = function (filePath) {
    var data = this;

    var filename = path.basename(filePath, '.mov');
    var ffmpeg = 'ffmpeg';
    ffmpeg += ' -i ' + sourceDir + '/mov/' + filePath;
    ffmpeg += ' -codec:v ' + data.vcodec;
    ffmpeg += ' -codec:a ' + data.acodec;
    ffmpeg += ' ' + filename + '.' + data.format;
    exec(ffmpeg, puts);

    /*var process = ffmpeg('mov/' + filePath);
    process.then(function (video) {
      video.setVideoFormat(data.format);
      video.setVideoCodec(data.vcodec);
      video.setAudioCodec(data.acodec);
      video.save(sourceDir + '/' + data.format + '/' + filename + '.' + data.format);
    }, function (err) {
      console.log('Error: ' + err);
    });*/

  };

  var movFile = function (fileName) {
    return path.extname(fileName) === '.mov';
  };

  list = _.filter(list, movFile);

  _.each(list, convert, {
    format: 'ogv',
    vcodec: 'libtheora',
    acodec: 'libvorbis'
  });
})
.done();