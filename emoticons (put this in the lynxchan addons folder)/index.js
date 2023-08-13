'use strict';

var settingsHandler = require('../../settingsHandler');
var verbose;

exports.engineVersion = '2.8';


const loadAddon = function(module_name) {
  try {
	  return require(`./${module_name}.js`);
      } catch(err) {
          console.log(`[Moe] Failed to load submodule: ${module_name}.js`);
	  console.log(err);

      }

}

exports.init = function() {
  var markdown = loadAddon('emote-markdown');

  if (settingsHandler.getGeneralSettings().verbose) {
    console.log('Emotes Loaded');
  }
};
