'use strict';
var uploadHandler = require('../../engine/uploadHandler.js');
var logger = require('../../logger');
var exec = require('child_process').exec;

var ffmpegGif;
var onlySfwImages;
var thumbSize;
var latestImages;
var mediaThumb;
var thumbExtension;

exports.loadSettings = function() {
  var settings = require('../../settingsHandler').getGeneralSettings();

  ffmpegGif = settings.ffmpegGifs;
  onlySfwImages = settings.onlySfwLatestImages;
  thumbSize = settings.thumbSize;
  latestImages = settings.globalLatestImages;
  mediaThumb = settings.mediaThumb;
  thumbExtension = settings.thumbExtension;
};


var videoThumbCommand = "ffmpeg -i {$path} -ss `ffprobe -i {$path} 2>&1 | grep"
                      + " Duration | awk '{print $2}' | tr -d , | awk -F ':' "
	              + "'{print ($3+$2*60+$1*3600)/2}'` -y -vframes 1  -vf scale=";


uploadHandler.generateVideoThumb = function(identifier, file, tooSmall, callback) {
  exports.loadSettings();

  var command = videoThumbCommand.replace(/\{\$path\}/g, file.pathInDisk);

  var extensionToUse = thumbExtension || 'png';

  var thumbDestination = file.pathInDisk + '_.' + extensionToUse;

  if (tooSmall) {
    command += '-1:-1';
  } else if (file.width > file.height) {
    command += thumbSize + ':-1';
  } else {
    command += '-1:' + thumbSize;
  }

  command += ' ' + thumbDestination;

  file.thumbMime = logger.getMime(thumbDestination);
  file.thumbOnDisk = thumbDestination;
  file.thumbPath = '/.media/t_' + identifier;

  exec(command, {
    maxBuffer : Infinity
  }, function createdThumb(error) {
    if (error) {
      callback(error);
    } else {
      uploadHandler.transferThumbToGfs(identifier, file, callback);
    }
  });

};
