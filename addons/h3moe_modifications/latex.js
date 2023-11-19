'use strict';

var common = require('../../engine/postingOps').common;
var latex;

try {
  latex = require('katex');
} catch {
   const { exec } = require("child_process");

    exec("npm install katex", (error, stdout, stderr) => {
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

    latex = require('katex');
}

exports.engineVersion = '2.5';


var max_expansions = 50;

var originalMarkdownText = common.markdownText;

common.markdownText = function(message, board, replaceCode, callback) {
  try {
    originalMarkdownText(message, board, replaceCode, callback);
  } catch (error) {
      if (error instanceof latex.ParseError) {
          var latex_error = error.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          if (latex_error.includes('Too many expansions')) {
	    latex_error = 'LaTeX Error: A line contained too many expansions. (Max: ' + max_expansions + ')';
          }
          else if (latex_error.includes('Undefined control sequence')) {
            latex_error = 'LaTeX' + latex_error.substring(18, latex_error.length);
          }
          else if (latex_error.includes('LaTeX-incompatible input')) {
            latex_error = 'LaTeX' + latex_error.substring(80, latex_error.length);
          }
	  else {
            latex_error = 'LaTeX' + latex_error;
	  }
          callback(latex_error);
       } else {
           throw error;
       }
   }
};


var latexInline = function(match) {
  var html_tex = latex.renderToString(match.substring(2, match.length - 2), 
                 {
                   output       : 'html',
                   displayMode  : false,
                   maxSize      : 10,
                   maxExpand    : max_expansions,
                   strict       : true,
		   throwOnError : true,
                   trust        : false,
                  }
                                    );
  return html_tex;
};

var latexBlock = function(match) {
  var html_tex = latex.renderToString(match.substring(2, match.length - 2), 
                 {
                   output       : 'html',
                   displayMode  : true,
                   maxSize      : 10,
                   maxExpand    : max_expansions,
                   strict       : true,
		   throwOnError : true,
                   trust        : false,
                  }
                                    );
  return html_tex;
};

var processLineOriginal = common.processLine;

common.processLine = function(split, replaceCode) {
  split = split.replace(/\$\$.*?\$\$/gm, latexInline);
  split = split.replace(/\\\[.*?\\\]/gm, latexBlock);
  return processLineOriginal(split, replaceCode);
};
