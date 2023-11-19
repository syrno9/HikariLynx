'use strict';

var stat = require('../../engine/domManipulator/static.js');

stat.setEngineInfo = function(document) {
  document = document.replace('__linkEngine_href__',
	  'http://gitgud.io/LynxChan/LynxChan');


  document = document.replace('__linkEngine_inner__', '');

  return document;
};
