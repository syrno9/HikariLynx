'use strict';

var templateHandler = require('../../engine/templateHandler.js');
var domManipCommon  = require('../../engine/domManipulator/common.js');
var domManipStatic  = require('../../engine/domManipulator/static.js');


//Catalog Templating
var catalogPage = templateHandler.pageTests.filter(function(page) { return page.template == 'catalogPage' })[0];
catalogPage.prebuiltFields.linkLogs = 'href';
catalogPage.prebuiltFields.bannerImage = 'src';

var originalCatalogElements = domManipStatic.setCatalogElements;

domManipStatic.setCatalogElements = function(boardData, language, threads, flagData) {

  var document = originalCatalogElements(boardData, language, threads, flagData);
  var boardUri = domManipCommon.clean(boardData.boardUri);
   
  document = document.replace('__bannerImage_src__', '/randomBanner.js?boardUri=' + boardUri);
  document = document.replace('__linkLogs_href__', '/logs.js?boardUri=' + boardData.boardUri);
  return document
};

// setFileLimits
const originalSetFileLimits = domManipCommon.setFileLimits;

domManipCommon.setFileLimits = function(document, bData, language) {
  var document = originalSetFileLimits(document, bData, language);

  // We have to grab maxRequestSizeMB from the settings as it's not passed through bData.
  var settings = require('../../settingsHandler').getGeneralSettings();
  var sizeToUse;

  if (settings.maxRequestSizeB) {
    sizeToUse = domManipCommon.formatFileSize(settings.maxRequestSizeB, language);
  }
  else {
    // TODO find out if this is needed and what it should be (limitless upload size?)
    sizeToUse = domManipCommon.formatFileSize(50 * 1048576, language);
  }

  return document.replace('__labelTotalMaxFileSize_inner__', sizeToUse);
}