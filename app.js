var ffmpeg = require('ffmpeg');
var _ = require('underscore');
var q = require('q');
var FS = require('q-io/fs');
var path = require('path');

var sourceDir = process.argv[2];

FS.list(sourceDir)
.then(function (list) {
  'use strict';
  var count = 0;
  
  var convert = function (path) {
    console.log(path);

    var process = ffmpeg('mov/' + path);
    process.then(function (video) {
      console.log(video.metadata);
    }, function (err) {
      console.log('Error: ' + err);
    });
    
  };
  
  var movFile = function (fileName) {
    return path.extname(fileName) === '.mov';
  };
  
  list = _.filter(list, movFile);
  
  _.each(list, convert);
});