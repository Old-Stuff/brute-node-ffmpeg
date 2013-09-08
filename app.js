/*var ffmpeg = require('ffmpeg');*/
var _ = require('underscore');
var q = require('q');
var FS = require('q-io/fs');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

var ffmpeg = require('fluent-ffmpeg');

var puts = function (error, stdout, stderr) {
  'use strict';
  sys.puts(stderr);
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
  
  var metaConvert = function (fullList, dataList) {
    if (dataList.length === 0) {
      return;
    }

    var format = dataList.shift();
    convertWrap(_.clone(list), format)
    .then(function () {
      metaConvert(fullList, dataList);
    });
  };
  
  var convertWrap = function (list, data) {
    var deferred = q.defer();
    convert(list, data, deferred);
    return deferred.promise;
  };
  
  var convert = function (list, data, deferred) {
    var filePath = list.shift();
    var filename = path.basename(filePath, '.mov');
    
    console.log('Converting ' + filename + ' to format ' + data.format);
    
    var proc = new ffmpeg({ source: sourceDir + '/mov/' + filePath })
    .withVideoCodec(data.vcodec)
    .withAudioCodec(data.acodec)
    .withAudioQuality(5)
    .addOption('-qscale:v', 7)
    .keepPixelAspect(true)
    .onProgress(function (progress) {
      process.stdout.write('Frames Rendered: ' + progress.frames + ' Percent Done: ' + progress.percent + '\r');
    })
    .saveToFile(sourceDir + '/' + data.format + '/' + filename + '.' + data.format, function (stdout, stderr) {
      console.log('');
      console.log('file has been converted succesfully\r');
      if (list.length === 0) {
        deferred.resolve();
      }
      else {
        convert(list, data, deferred);
      }
    });
  };

  var movFile = function (fileName) {
    return path.extname(fileName) === '.mov';
  };

  list = _.filter(list, movFile);

  metaConvert(list, [{
    format: 'ogv',
    vcodec: 'libtheora',
    acodec: 'libvorbis'
  }, {
    format: 'wmv',
    vcodec: 'msmpeg4',
    acodec: 'wmav2'
  }]);
})
.done();