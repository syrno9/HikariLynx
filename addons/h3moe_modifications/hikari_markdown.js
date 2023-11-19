'use strict';

var common = require('../../engine/postingOps').common;

var moeFunction = function(match) {
  var content = match.substring(5, match.length - 6);
  return '<span class="moeText">' + content + '</span>';
};

var magnetFunction = function(match) {
  return '<span class="magnetLink">' + '<a href="' + '    ' + match.replace(/&amp;/g, '&') + '">' + match.substring(20, 28) + '</a>' + '</span>';
};

var doomFunction = function(match) {
  var content = match.substring(6, match.length - 7);
  return '<span class="doomText">' + content + '</span>';
};

var boardTextFunction = function(match) {
  var content = match.substring(7, match.length - 8);
  return '<span class="boardText">' + content + '</span>';

};

var diceFunction = function(match) {
  var [num_of_dice, num_of_faces, modifier] = match.substring(6, match.length - 1).split(/d|[+-]/i);
  var mod_op = ''
  var rolls = [];
  var sum = 0;
  
  //Record all rolls
  if (num_of_faces != 0) {
    for (var i = 0; i < num_of_dice; ++i) {
      var roll = Math.floor(Math.random() * num_of_faces + 1);
      sum += roll;
      rolls.push(roll);
    }
  }

  //Handle any modifiers
  if (modifier != null) {
    modifier = Number(modifier);
    console.log(modifier);
    if (match.includes('+')) {
        sum += modifier;
        mod_op = '+';
    } else {
        sum -= modifier;
	mod_op = '-';
    }
  sum = Math.max(sum, 0);
  }

  return '<span class="diceRoll" title="' + rolls.join(', ') + '">'
	 + num_of_dice + 'd' + num_of_faces + mod_op + ((modifier != null) ? modifier : '') +' = ' + sum + '</span>';
};

var penisFunction = function(match) {
  var randomBackgroundColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  var randomColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  
  return '<span style="background-color: ' + randomBackgroundColor + '; color: ' + randomColor + ';">' + match + '</span>';
};

var vaginaFunction = function(match) {
  var randomBackgroundColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  var randomColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  
  return '<span style="background-color: ' + randomBackgroundColor + '; color: ' + randomColor + ';">' + match + '</span>';
};

var buttsexFunction = function(match) {
  var randomBackgroundColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  var randomColor = 'rgb(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ')';
  
  return '<span style="background-color: ' + randomBackgroundColor + '; color: ' + randomColor + ';">' + match + '</span>';
};

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

var emote17Function = function(match) {
  return '<img src="/.static/emotes/neco_dance.gif" width="45">'
};

var emote18Function = function(match) {
  return '<img src="/.static/emotes/neco.gif" width="45">'
};

var emote19Function = function(match) {
  return '<img src="/.static/emotes/neco_dance2.gif" width="45">'
};

var boldFunction = function(match) {
  var content = match.substring(3, match.length - 4); 
  return '<strong>' + content + '</strong>'; 
};

var italicFunction = function(match) {
  var content = match.substring(3, match.length - 4);
  return '<em>' + content + '</em>';
};

var strikeFunction = function(match) {
  var content = match.substring(3, match.length - 4);
  return '<s>' + content + '</s>';
};

var underlineFunction = function(match) {
  var content = match.substring(3, match.length - 4);
  return '<u>' + content + '</u>';
};

var s1Function = function(match) {
  var content = match.substring(4, match.length - 5); 
  return '<span class="s1">' + content + '</span>'; 
};

var s2Function = function(match) {
  var content = match.substring(4, match.length - 5); 
  return '<span class="s2">' + content + '</span>'; 
};

var s3Function = function(match) {
  var content = match.substring(4, match.length - 5); 
  return '<span class="s3">' + content + '</span>'; 
};

var s4Function = function(match) {
  var content = match.substring(4, match.length - 5); 
  return '<span class="s4">' + content + '</span>'; 
};

var s5Function = function(match) {
  var content = match.substring(4, match.length - 5); 
  return '<span class="s5">' + content + '</span>'; 
};

var s6Function = function(match) {
  var content = match.substring(4, match.length - 5); 
  return '<span class="s6">' + content + '</span>'; 
};

var s7Function = function(match) {
  var content = match.substring(4, match.length - 5); 
  return '<span class="s7">' + content + '</span>'; 
};

var c1Function = function(match) {
  var content = match.substring(5, match.length - 6);
  return '<span class="c1">' + content + '</span>';
};

var c2Function = function(match) {
  var content = match.substring(8, match.length - 9);
  return '<span class="c2">' + content + '</span>';
};

var c3Function = function(match) {
  var content = match.substring(7, match.length - 8);
  return '<span class="c3">' + content + '</span>';
};

var c4Function = function(match) {
  var content = match.substring(8, match.length - 9);
  return '<span class="c4">' + content + '</span>';
};

var c5Function = function(match) {
  var content = match.substring(6, match.length - 7);
  return '<span class="c5">' + content + '</span>';
};

var c6Function = function(match) {
  var content = match.substring(8, match.length - 9);
  return '<span class="c6">' + content + '</span>';
};

var c7Function = function(match) {
  var content = match.substring(7, match.length - 8);
  return '<span class="c7">' + content + '</span>';
};

var c8Function = function(match) {
  var content = match.substring(6, match.length - 7);
  return '<span class="c8">' + content + '</span>';
};

var c9Function = function(match) {
  var content = match.substring(11, match.length - 12);
  return '<span class="c9">' + content + '</span>';
};

var powerfulFunction = function(match) {
  var content = match.substring(9, match.length - 10); 
  return '<span class="powerful">' + content + '</span>'; 
};

var processLineOriginal = common.processLine;

common.processLine = function(split, replaceCode) {
  split = split.replace(/penis/gi, penisFunction);
  split = split.replace(/vagina/gi, vaginaFunction);
  split = split.replace(/buttsex/gi, buttsexFunction);
  split = split.replace(/\[moe\].*\[\/moe\]/gi, moeFunction);
  split = split.replace(/\[doom\].*\[\/doom\]/gi, doomFunction);
  split = split.replace(/\[board\].*\[\/board\]/gi, boardTextFunction);
  split = split.replace(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}&amp;dn=.+&amp;tr=.+/gi, magnetFunction);
  split = split.replace(/\/roll{[0-9]{1,2}d[0-9]{1,6}([+-]?[0-9]+)?}/gi, diceFunction);
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
  split = split.replace(/:neco_dance:/gi, emote17Function);
  split = split.replace(/:neco_arc:/gi, emote18Function);
  split = split.replace(/:neco_dance2:/gi, emote19Function);
  split = split.replace(/\[b\](.*?)\[\/b\]/gi, boldFunction);
  split = split.replace(/\[i\](.*?)\[\/i\]/gi, italicFunction);
  split = split.replace(/\[s\](.*?)\[\/s\]/gi, strikeFunction);
  split = split.replace(/\[u\](.*?)\[\/u\]/gi, underlineFunction);
  split = split.replace(/\[s1\](.*?)\[\/s1\]/gi, s1Function);
  split = split.replace(/\[s2\](.*?)\[\/s2\]/gi, s2Function);
  split = split.replace(/\[s3\](.*?)\[\/s3\]/gi, s3Function);
  split = split.replace(/\[s4\](.*?)\[\/s4\]/gi, s4Function);
  split = split.replace(/\[s5\](.*?)\[\/s5\]/gi, s5Function);
  split = split.replace(/\[s6\](.*?)\[\/s6\]/gi, s6Function);
  split = split.replace(/\[s7\](.*?)\[\/s7\]/gi, s7Function);
  split = split.replace(/\[rainbow\](.*?)\[\/rainbow\]/gi, powerfulFunction);
  split = split.replace(/\[red\](.*?)\[\/red\]/gi, c1Function);
  split = split.replace(/\[orange\](.*?)\[\/orange\]/gi, c2Function);
  split = split.replace(/\[brown\](.*?)\[\/brown\]/gi, c3Function);
  split = split.replace(/\[purple\](.*?)\[\/purple\]/gi, c4Function);
  split = split.replace(/\[pink\](.*?)\[\/pink\]/gi, c5Function);
  split = split.replace(/\[yellow\](.*?)\[\/yellow\]/gi, c6Function);
  split = split.replace(/\[green\](.*?)\[\/green\]/gi, c7Function);
  split = split.replace(/\[blue\](.*?)\[\/blue\]/gi, c8Function);
  split = split.replace(/\[lightblue\](.*?)\[\/lightblue\]/gi, c9Function);
  return processLineOriginal(split, replaceCode);
};
