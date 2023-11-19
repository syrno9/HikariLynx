'use strict';

var specificOps = require('../../engine/modOps/ipBanOps/specificOps.js');
var lang = require('../../engine/langOps').languagePack;
var mongo = require('mongodb');
var locationOps;
var captchaOps;
var logOps;
var common;
var logger;
var miscOps = require('../../engine/miscOps.js');
var lang;
var ObjectID = mongo.ObjectId;
var db = require('../../db');
var boards = db.boards();
var bans = db.bans();
var posts = db.posts();
var threads = db.threads();
var defaultWarnMessage;
var defaultBanMessage;
var noBanCaptcha;
var verbose;
var minClearIps;
var redactModNames;

var originalLoadSettings = specificOps.loadSettings;

defaultWarnMessage = lang().miscDefaultWarnMessage;
if (!defaultWarnMessage) {
  defaultWarnMessage = "(USER WAS WARNED FOR THIS POST)";
}

specificOps.loadDependencies();

specificOps.updateThreadsBanMessage = function(pages, parentThreads, userData,
    parameters, callback, informedThreads, informedPosts, board) {
  var message = parameters.banType == 4 ? defaultWarnMessage : defaultBanMessage;

  threads.updateMany({
    boardUri : board,
    threadId : {
      $in : informedThreads
    }
  }, {
    $set : {
      banMessage : parameters.banMessage || message
    },
    $unset : miscOps.individualCaches
  }, function setMessage(error) {

    if (error) {
      return callback(error);
    }

    // style exception, too simple
    posts.updateMany({
      boardUri : board,
      postId : {
        $in : informedPosts
      }
    }, {
      $set : {
        banMessage : parameters.banMessage || message
      },
      $unset : miscOps.individualCaches
    }, function setMessage(error) {

      if (error) {
        return callback(error);
      }

      specificOps.reloadPages(pages, board, informedThreads, informedPosts,
          parentThreads);

      specificOps.logBans(userData, board, informedPosts, informedThreads,
          parameters, callback);

    });
    // style exception, too simple

  });

};

