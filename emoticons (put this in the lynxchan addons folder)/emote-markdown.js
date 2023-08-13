'use strict';

var common = require('../../engine/postingOps').common;

var emote1Function = function(match) {
  return '<img src="/.static/emotes/angry.gif" width="45">'
};

var emote2Function = function(match) {
  return '<img src="/.static/emotes/annoyed.png" width="45">'
};

var emote3Function = function(match) {
  return '<img src="/.static/emotes/annoyed2.png" width="45">'
};

var emote4Function = function(match) {
  return '<img src="/.static/emotes/cry.gif" width="45">'
};

var emote5Function = function(match) {
  return '<img src="/.static/emotes/down.gif" width="45">'
};

var emote6Function = function(match) {
  return '<img src="/.static/emotes/happy.png" width="45">'
};

var emote7Function = function(match) {
  return '<img src="/.static/emotes/happy2.png" width="45">'
};

var emote8Function = function(match) {
  return '<img src="/.static/emotes/happy3.png" width="45">'
};

var emote9Function = function(match) {
  return '<img src="/.static/emotes/neco.png" width="45">'
};

var emote10Function = function(match) {
  return '<img src="/.static/emotes/nya.png" width="45">'
};

var emote11Function = function(match) {
  return '<img src="/.static/emotes/snicker.gif" width="45">'
};

var emote12Function = function(match) {
  return '<img src="/.static/emotes/vengence.gif" width="45">'
};

var emote13Function = function(match) {
  return '<img src="/.static/emotes/sleep.png" width="45">'
};

var emote14Function = function(match) {
  return '<img src="/.static/emotes/laugh.gif" width="45">'
};

var emote15Function = function(match) {
  return '<img src="/.static/emotes/drool.gif" width="45">'
};

var emote16Function = function(match) {
  return '<img src="/.static/emotes/disgust.png" width="45">'
};

var processLineOriginal = common.processLine;

common.processLine = function(split, replaceCode) {
  split = split.replace(/:angry:/gi, emote1Function);
  split = split.replace(/:annoyed:/gi, emote2Function);
  split = split.replace(/:annoyed2:/gi, emote3Function);
  split = split.replace(/:cry:/gi, emote4Function);
  split = split.replace(/:down:/gi, emote5Function);
  split = split.replace(/:happy:/gi, emote6Function);
  split = split.replace(/:happy2:/gi, emote7Function);
  split = split.replace(/:surprised:/gi, emote8Function);
  split = split.replace(/:neco:/gi, emote9Function);
  split = split.replace(/:nya:/gi, emote10Function);
  split = split.replace(/:snicker:/gi, emote11Function);
  split = split.replace(/:vengence:/gi, emote12Function);
  split = split.replace(/:sleep:/gi, emote13Function);
  split = split.replace(/:laugh:/gi, emote14Function);
  split = split.replace(/:drool:/gi, emote15Function);
  split = split.replace(/:disgust:/gi, emote16Function);
  return processLineOriginal(split, replaceCode);
};
