'use strict';

var postingDelOps = require('../../engine/deletionOps/postingDelOps.js');

var originalPosting = postingDelOps.posting;

postingDelOps.posting = function(userData, parameters, threadsToDelete, postsToDelete, language, callback) {
  if (userData != null && userData.globalRole > 1 && parameters.action === 'delete') {
    parameters.action = 'trash'; 
  }
  originalPosting(userData, parameters, threadsToDelete, postsToDelete, language, callback);
};
