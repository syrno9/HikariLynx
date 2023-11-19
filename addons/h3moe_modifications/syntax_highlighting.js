'use strict';

var common = require('../../engine/postingOps').common;
var miscOps = require('../../engine/miscOps');
var settings = require('../../settingsHandler').getGeneralSettings();
var hljs;

try {
  hljs = require('highlight.js');
} catch {
   const { exec } = require("child_process");

    exec("npm install highlight.js", (error, stdout, stderr) => {
        if (error) {
            console.log(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });

    hljs = require('highlight.js');
}



var unescapeHTML = function(html) {
    html = html.replace(/&amp;/g, '&');
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    html = html.replace(/&quot;/g, '"');
    html = html.replace(/&#39;/g, "'");
    html = html.replace(/&apos;/g, "'");
    return html;
};

common.replaceStyleMarkdown = function(message, replaceCode, boardMessage) {

  var codeSplits = replaceCode ? common.getTagSplits(message, 'code') : [];
  var lastEnding = 0;
  var finalMessage = '';

  for (var i = 0; i < codeSplits.length; i++) {
    var split = codeSplits[i];
    finalMessage += common.replaceChunkMarkdown(message.substring(lastEnding,
        split.start));

    var codeChunk = unescapeHTML(message.substring(split.start + 6, split.end).trim());
    var css_class = codeChunk.includes('\n') ? 'block' : 'inline';
    finalMessage += '<span class="' + css_class + 'Code"><code>' + hljs.highlightAuto(codeChunk).value + '</code></span>';

    lastEnding = split.end + 7;
  }


  finalMessage += common.replaceChunkMarkdown(message.substring(lastEnding));
  if (!settings.dontProcessLinks && !boardMessage) {
    finalMessage = finalMessage.replace(/(http|https)\:\/\/[^<\s]+/g,
        function links(match) {
          match = miscOps.cleanHTML(match).replace(/[_='~*]/g,
              function sanitization(innerMatch) {
                return common.linkSanitizationRelation[innerMatch];
              });
          return '<a target="_blank" href="' + match + '">' + match + '</a>';
        });
  }

  return finalMessage;
};
