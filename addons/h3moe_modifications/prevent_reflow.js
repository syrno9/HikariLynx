'use strict';

var common = require('../../engine/domManipulator/common.js');
var domStatic = require('../../engine/domManipulator/static.js');
var templateHandler = require('../../engine/templateHandler.js').getTemplates;
var lang = require('../../engine/langOps').languagePack;


var calculateThumbSize = function(width, height, max_size) {
  var thumb_dims = {
    'width' : max_size,
    'height' : max_size
  }
  if (width < max_size && height < max_size) {
    thumb_dims.width = width;
    thumb_dims.height = height;
  }  
  else if (width > height) {
    thumb_dims.height = Math.round((height / width) * max_size);
  }
   else if (height > width) {
    thumb_dims.width = Math.round((width / height) * max_size);
  }
  return thumb_dims;
}

domStatic.setCatalogCellThumb = function(thread, language) {

  var href = '/' + common.clean(thread.boardUri) + '/res/';
  href += thread.threadId + '.html';

  var cell = templateHandler(language).catalogCell.template.replace(
      '__linkThumb_href__', href);


  if (thread.files && thread.files.length) {
    var thumb_dims = calculateThumbSize(thread.files[0].width, thread.files[0].height, 128);
    var img = '<img  loading="lazy" width="' + thumb_dims.width + '" height="' + thumb_dims.height + '" src="';
    img += common.clean(thread.files[0].thumb) + '">';
    cell = cell.replace('__linkThumb_inner__', img).replace(
        '__linkThumb_mime__', thread.files[0].mime);
  } else {
    cell = cell.replace('__linkThumb_inner__', lang(language).guiOpen).replace(
        '__linkThumb_mime__', '');
  }
  return cell;
};

domStatic.getLatestImages = function(latestImages, language) {

  var children = '';

  for (var i = 0; i < latestImages.length; i++) {
    var image = latestImages[i];
    
    var boardUri = common.clean(image.boardUri);
    var postLink = '/' + boardUri + '/res/' + image.threadId + '.html';

    postLink += '#' + (image.postId || image.threadId);

    //var thumb_dims = calculateThumbSize(latestImages[i].width, latestImages[i].height, 125);

    var cell = '<a href="' + postLink + '"><img loading="lazy" height="auto" width="auto" src="';
    children += cell + image.thumb + '"></a>';
  }
  return children;
};

common.setUploadLinks = function(cell, file) {

  cell = cell.replace('__imgLink_href__', file.path);
  cell = cell.replace('__imgLink_mime__', file.mime);

  if (file.width) {
    cell = cell.replace('__imgLink_width__', file.width);
    cell = cell.replace('__imgLink_height__', file.height);
  } else {
    cell = cell.replace('data-filewidth="__imgLink_width__"', '');
    cell = cell.replace('data-fileheight="__imgLink_height__"', '');
  }

  cell = cell.replace('__nameLink_href__', file.path);

  var thumb_dims = (file.thumb.includes('spoiler') || file.thumb.includes('generic')) ? { 'width' : 125, 'height' : 125 } : calculateThumbSize(file.width, file.height, 225);
  var img = '<img loading="lazy" width="' + thumb_dims.width 
            + '" height="' + thumb_dims.height 
            + '" src="' + file.thumb + '">';

  cell = cell.replace('__imgLink_children__', img);

  var originalName = common.clean(file.originalName);

  cell = cell.replace('__originalNameLink_inner__', originalName);
  cell = cell.replace('__originalNameLink_download__', originalName);
  cell = cell.replace('__originalNameLink_href__', file.path);

  return cell;
};
