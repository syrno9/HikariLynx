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
  var markdown = loadAddon('hikari_markdown');
  var syntax   = loadAddon('syntax_highlighting');
  var latex    = loadAddon('latex');
  var sageBox  = loadAddon('sage_box');
  var fortuneBox  = loadAddon('fortune_box');
  var bumplock = loadAddon('bumplock');
  var reflow   = loadAddon('prevent_reflow');
  var filter   = loadAddon('evade_filter');
  var vidThumb = loadAddon('video_thumbs');
  var template = loadAddon('extend_templates');
  var deletion = loadAddon('delete_permissions');
  var warn     = loadAddon('warning');
  var footer   = loadAddon('clean_footer');

  if (settingsHandler.getGeneralSettings().verbose) {
    console.log('Moe Modifications Loaded');
  }
};
