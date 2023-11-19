'use strict';

var posting = require('../../engine/postingOps');

var post = posting.post;
var thread = posting.thread;


var originalPost = post.newPost;
post.newPost = function(req, userData, parameters, captchaId, callback) {
  if (parameters.sage) {
    parameters.email = 'sage';
  }
  originalPost(req, userData, parameters, captchaId, callback);
};

var originalThread = thread.newThread;
thread.newThread = function(req, userData, parameters, captchaId, cb) {
  if (parameters.sage) {
    parameters.email = 'sage';
  }
  originalThread(req, userData, parameters, captchaId, cb);
};

//no display sage
var originalGetNew = post.getNewPost;
post.getNewPost = function(req, parameters, userData, postId, thread, board, wishesToSign) {
  var newParams = Object.assign({}, parameters);
  if (newParams.email == 'sage') {
    newParams.email = null;
  }
  return originalGetNew(req, newParams, userData, postId, thread, board, wishesToSign)
};
