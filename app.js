var ffmpeg = require('ffmpeg');
var _ = require('underscore');
var q = require('q');
var FS = require('q-io/fs');

FS.list(__dirname)
.then(function (list) {
  'use strict';
  console.log(list);
});

try {
  var original = new ffmpeg(__dirname + '/samples/prores422_29.97.mov');
  original.then(function (video) {
    'use strict';
    console.log('The video is ready to be processed');
  }, function (err) {
    'use strict';
    console.log('Error: ' + err);
  });
} catch (e) {
  console.log(e.code);
  console.log(e.msg);
}