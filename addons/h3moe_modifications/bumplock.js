'use strict';

var modOps = require('../../engine/modOps').edit;
var db = require('../../db');
var threads = db.threads();
var boards = db.boards();
var miscOps = require('../../engine/miscOps');
var postOps = require('../../engine/postingOps').common;
var postingOps = require('../../engine/postingOps').post;
var domStatic = require('../../engine/domManipulator/static.js');
var templateHandler = require('../../engine/templateHandler');


//Replace the entire function. Necessary because built-in function overwrites autoSage.
modOps.setNewThreadSettings = function(parameters, thread, callback) {
  console.log(parameters);
  parameters.lock = !!parameters.lock;
  parameters.pin = !!parameters.pin;
  parameters.cyclic = !!parameters.cyclic;
  parameters.bumplock = !!parameters.bumplock;

  var changePin = parameters.pin !== !!thread.pinned;
  var changeLock = parameters.lock !== !!thread.locked;
  var changeCyclic = parameters.cyclic !== !!thread.cyclic;
  var changeSage = parameters.bumplock !== !!thread.autoSage;
  var boardData = boards.findOne( { boardUri : thread.boardUri });
  var limitToUse = postingOps.getBumpLimit(boardData);
  var postCount = thread.postCount ? thread.postCount : 0;

  if (!changeLock && !changePin && !changeCyclic && !changeSage) {
    callback();
    return;
  }

  threads.updateOne({
    _id : thread._id
  }, {
    $set : {
      locked : parameters.lock,
      pinned : parameters.pin,
      cyclic : parameters.cyclic,
      autoSage : (!(postCount < limitToUse) && !parameters.cyclic) || (parameters.bumplock)
    },
    $unset : miscOps.individualCaches
  }, function updatedThread(error) {
    if (!error) {
      // signal rebuild of thread
      process.send({
        board : thread.boardUri,
        thread : thread.threadId
      });
      if (changePin) {
        // signal rebuild of board pages
        postOps.setThreadsPage(thread.boardUri, function(errr) {
          if (error) {
            console.log(error);
          } else {
            process.send({
              board : thread.boardUri
            });
          }
        });

      } else {
        // signal rebuild of page
        process.send({
          board : thread.boardUri,
          page : thread.page
        });
      }
    }
    callback(error);
  });
};

//Check if FE has checkbox in thread.html template
templateHandler.pageTests[10]['prebuiltFields']['checkboxBumplock'] = 'checked';

var originalSetModdingInformation = domStatic.setModdingInformation;

domStatic.setModdingInformation = function(document, threadData) {
  if (threadData.autoSage) {
    document = document.replace('__checkboxBumplock_checked__', 'true');
  } else {
    document = document.replace('checked="__checkboxBumplock_checked__', '');
  }
  return originalSetModdingInformation(document, threadData);
};

