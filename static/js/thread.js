var thread = {};

var active_refresh_time = 10;

thread.init = function() {

  api.mod = !!document.getElementById('divMod');

  api.hiddenCaptcha = !document.getElementById('captchaDiv');

  document.getElementById('checkboxChangeRefresh').onchange = thread.changeRefresh;

  document.getElementsByTagName('body')[0].onscroll = function() {

    if (!thread.unreadPosts || !thread.lastPost) {
      return;
    }

    var rect = thread.lastPost.getBoundingClientRect();

    if (rect.bottom < window.innerHeight) {
      thread.unreadPosts = 0;

      document.title = thread.originalTitle;
    }

  };

  api.boardUri = document.getElementById('boardIdentifier').value;
  var linkLogs = document.getElementsByClassName("linkLogs")[0]
  if (linkLogs !== undefined) 
    linkLogs.href = "/logs.js?boardUri=" + api.boardUri;

  thread.divPosts = document.getElementsByClassName('divPosts')[0];
  document.getElementsByClassName('divRefresh')[0].style.display = 'block';

  thread.messageLimit = +document.getElementById('labelMessageLength').innerText;
  thread.refreshLabel = document.getElementById('labelRefresh');
  thread.wsStatusLabel = document.getElementById('labelWsStatus');
  thread.autoIndicator = document.getElementById('labelAutoIndicator');

  thread.refreshButton = document.getElementById('refreshButton');
  thread.refreshButton.onclick = function() { thread.refreshPosts(true) };
  thread.lastRefresh = 0;

  thread.initThread();

  //TODO: most of these would be better-replaced by the parent form's onsubmit

  if (document.getElementById('divArchive')) {
    api.convertButton('archiveFormButton', thread.archiveThread, 'archiveField');
  }

  if (document.getElementById('divMerge')) {
    api.convertButton('mergeFormButton', thread.mergeThread, 'mergeField');
  }

  if (document.getElementById('controlThreadIdentifier')) {

    api.convertButton('settingsFormButton', thread.saveThreadSettings,
        'threadSettingsField');

    if (document.getElementById('ipDeletionForm')) {
      api.convertButton('deleteFromIpFormButton', thread.deleteFromIp,
          'ipDeletionField');
    }

    if (document.getElementById('formTransfer')) {
      api.convertButton('transferFormButton', thread.transfer, 'transferField');
    }

    api.convertButton('inputBan', postCommon.banPosts, 'banField');
    api.convertButton('inputIpDelete', postCommon.deleteFromIpOnBoard);
    api.convertButton('inputThreadIpDelete', postCommon.deleteFromIpOnThread);
    api.convertButton('inputSpoil', postCommon.spoilFiles);

  }

  //TODO (see above): ...like this:
  thread.replyButton = document.getElementById('formButton');
  thread.postingForm = document.getElementById('postingFormContents').parentNode;

  thread.postingForm.onsubmit = function(e) {
    e.preventDefault()
    thread.postReply();
  }

  var archiveLinks = document.getElementsByClassName('archiveLinkThread');
  for (var i = 0; i < archiveLinks.length; i++) {
    var archiveLink = archiveLinks[i];
    archiveLink.href = 'http://archive.today/?run=1&url='+encodeURIComponent(document.location);
    archiveLink.parentNode.style.display = 'inline-block';
  }

  var replies = document.getElementsByClassName('postCell');

  if (replies && replies.length) {
    thread.lastReplyId = replies[replies.length - 1].id;
  }

  api.localRequest('/' + api.boardUri + '/res/' + api.threadId + '.json',
      function(error, data) {

        if (error) {
          return thread.changeRefresh();
        }

        try {
          data = JSON.parse(data);
        } catch (error) {
          return thread.changeRefresh();
        }

        thread.wssPort = data.wssPort;
        thread.wsPort = data.wsPort;
        thread.changeRefresh();

      });

  var refreshCheckbox = document.getElementById("checkboxChangeRefresh");
  refreshCheckbox.onchange = function() { thread.changeRefresh() };

  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
       thread.lastRefresh = 600;
    } else {
	thread.lastRefresh = active_refresh_time;
	thread.currentRefresh = active_refresh_time;
    }
  })

  //initial refresh to update the count indicators
  thread.refreshPosts();

};

thread.initThread = function() {

  if (thread.retryTimer) {
    clearInterval(thread.retryTimer);
    delete thread.retryTimer;
  }
  thread.expectedPosts = [];
  thread.lastReplyId = 0;
  thread.originalTitle = document.title;

  thread.unreadPosts = 0;
  api.threadId = +document.getElementsByClassName('opCell')[0].id;
  thread.refreshURL = '/' + api.boardUri + '/res/' + api.threadId + '.json';
  thread.refreshParameters = {
    boardUri : api.boardUri,
    threadId : api.threadId
  };

};

thread.transfer = function() {

  var informedBoard = document.getElementById("fieldDestinationBoard").value
      .trim();

  api.formApiRequest('transferThread', {
    boardUri : api.boardUri,
    threadId : api.threadId,
    boardUriDestination : informedBoard
  },
      function setLock(status, data) {

        if (status === 'ok') {
          window.location.pathname = '/' + informedBoard + '/res/' + data
              + '.html';
        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

};

thread.markPost = function(id) {

  if (isNaN(id)) {
    return;
  }

  if (thread.markedPosting && thread.markedPosting.className === 'markedPost') {
    thread.markedPosting.className = 'innerPost';
  }

  var container = document.getElementById(id);

  if (!container || container.className !== 'postCell') {
    return;
  }

  thread.markedPosting = container.getElementsByClassName('innerPost')[0];

  if (thread.markedPosting) {
    thread.markedPosting.className = 'markedPost';
  }

};

thread.processPostingQuote = function(link) {

  link.onclick = function() {
    qr.showQr(link.href.match(/#q(\d+)/)[1]);
  };

};

thread.mergeThread = function() {

  var informedThread = document.getElementById("fieldDestinationThread").value
      .trim();

  var destinationThread = document.getElementById("fieldDestinationThread").value;

  api.formApiRequest('mergeThread', {
    boardUri : api.boardUri,
    threadSource : api.threadId,
    threadDestination : destinationThread
  }, function setLock(status, data) {

    if (status === 'ok') {
      window.location.pathname = '/' + api.boardUri + '/res/'
          + destinationThread + '.html';
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

thread.archiveThread = function() {

  if (!document.getElementById('checkboxArchive').checked) {
    alert('You must confirm that you wish to archive this thread.');
    return;
  }

  api.formApiRequest('archiveThread', {
    confirmation : true,
    boardUri : api.boardUri,
    threadId : api.threadId
  }, function archived(status, data) {

    if (status === 'ok') {

      api.resetIndicators({
        locked : document.getElementsByClassName('lockIndicator').length,
        bumplock : document.getElementsByClassName('bumpLockIndicator').length,
        pinned : document.getElementsByClassName('pinIndicator').length,
        cyclic : document.getElementsByClassName('cyclicIndicator').length,
        archived : true
      });

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

};

thread.saveThreadSettings = function() {

  var pinned = document.getElementById('checkboxPin').checked;
  var bumplock = document.getElementById('checkboxBumplock').checked;
  var locked = document.getElementById('checkboxLock').checked;
  var cyclic = document.getElementById('checkboxCyclic').checked;

  api.formApiRequest('changeThreadSettings', {
    boardUri : api.boardUri,
    threadId : api.threadId,
    pin : pinned,
    lock : locked,
    cyclic : cyclic,
    bumplock : bumplock
  }, function setLock(status, data) {

    if (status === 'ok') {

      api.resetIndicators({
        locked : locked,
        pinned : pinned,
        cyclic : cyclic,
        bumplock : bumplock,
        archived : document.getElementsByClassName('archiveIndicator').length
      });

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

thread.replyCallback = function(status, data) {

  if (status === 'ok') {

    postCommon.storeUsedPostingPassword(api.boardUri, api.threadId, data);
    api.addYou(api.boardUri, data);

    document.getElementById('fieldMessage').value = '';
    document.getElementById('fieldSubject').value = '';
    qr.clearQRAfterPosting();
    postCommon.clearSelectedFiles();
 
    document.getElementById('footer').scrollIntoView();

    if (!thread.autoRefresh || !thread.socket) {
      thread.refreshPosts(true);
    }

  } else {
    alert(status + ': ' + JSON.stringify(data));
  }

};

thread.replyCallback.stop = function() {

  thread.replyButton.value = thread.originalButtonText;

  qr.setQRReplyText(thread.originalButtonText);

  thread.replyButton.disabled = false;
  qr.setQRReplyEnabled(true);

};

thread.replyCallback.progress = function(info) {

  if (info.lengthComputable) {
    var newText = 'Uploading ' + Math.floor((info.loaded / info.total) * 100)
        + '%';
    thread.replyButton.value = newText;

    qr.setQRReplyText(newText);
  }

};

thread.refreshCallback = function(error, receivedData) {

  if ((api.mod && (error !== 'ok')) || (!api.mod && error)) {
    return;
  }

  if (!api.mod) {
    receivedData = JSON.parse(receivedData);
  }

  if (receivedData.threadId !== api.threadId) {

    window.location.href = '/' + receivedData.boardUri + '/res/'
        + receivedData.threadId + '.html';

    return;
  }

  if (thread.fullRefresh) {
    thread.lastReplyId = 0;
    thread.unreadPosts = 0;
    while (thread.divPosts.firstChild) {
      thread.divPosts.removeChild(thread.divPosts.firstChild);
    }

    document.title = thread.originalTitle;

  }

  thread.wsPort = receivedData.wsPort;
  thread.wssPort = receivedData.wssPort;
  if (!thread.socket || thread.socket.readyState > 1) { //still closed
	thread.stopWs();
  	thread.startWs();
  }

  if (typeof tooltips !== "undefined") {
    tooltips.cacheData(receivedData);
  }

  var posts = receivedData.posts;

  var foundPosts = false;

  if (posts && posts.length) {
    var lastReceivedPost = posts[posts.length - 1];

    if (lastReceivedPost.postId > thread.lastReplyId) {
      foundPosts = true;

      for (var i = 0; i < posts.length; i++) {

        var post = posts[i];

        if (post.postId > thread.lastReplyId) {
           //only unread if the post isn't (You)
           if (typeof posting !== "undefined" && posting.yous) {
             if (posting.yous.indexOf(+post.postId) === -1) {
               thread.unreadPosts++;
             }
           } else {
             thread.unreadPosts++;
           }

          if (thread.expectedPosts.indexOf(post.postId) >= 0) {
            thread.expectedPosts.splice(thread.expectedPosts
                .indexOf(post.postId), 1);

          }

          var postCell = posting.addPost(post, api.boardUri, api.threadId);

          thread.divPosts.appendChild(postCell);

          thread.lastPost = postCell;

          thread.lastReplyId = post.postId;
        }

      }

      if (!thread.fullRefresh && thread.unreadPosts > 0) {
        document.title = '(' + thread.unreadPosts + ') ' + thread.originalTitle;
      }

    }

    if (thread.expectedPosts.length && !thread.retryTimer) {

      thread.expectedPosts = [];

      thread.retryTimer = setTimeout(function() {

        delete thread.retryTimer;

        if (!thread.refreshingThread) {
          thread.refreshPosts();
        }

      }, 10000);
    }
  }

  var counts = posts.reduce((acc, post) => {
    if (acc.ids.indexOf(post.id) === -1)
      acc.ids.push(post.id);
  	acc.files += post.files.length;
  	return acc;
  }, {
    files:	0,
    ids: 	[]
  })
  
  var postCount = document.getElementById('postCount')
  postCount.innerText = posts.length;
  var idCount = document.getElementById('idCount');
  if (counts.ids) {
    idCount.innerText = counts.ids.length;
    idCount.style.display = "inline";
  } else {
    idCount.innerText = counts.ids.length;
    idCount.style.display = "none";
  }
  document.getElementById('fileCount').innerText = counts.files;
  postCount.parentNode.style.display = "inherit";

  if (thread.autoRefresh
      && !(!JSON.parse(localStorage.noWs || 'false') && (thread.wsPort || thread.wssPort))) {
    thread.startTimer(thread.manualRefresh || foundPosts ? 5
        : thread.lastRefresh * 2);
  }

};

thread.refreshCallback.stop = function() {

  thread.refreshButton.disabled = false;

  thread.refreshingThread = false;

  if (typeof sideCatalog !== "undefined" && sideCatalog.waitingForRefreshData) {
    sideCatalog.loadThread(sideCatalog.waitingForRefreshData.cell,
        sideCatalog.waitingForRefreshData.thread);
    delete sideCatalog.waitingForRefreshData;
  }

};

thread.refreshPosts = function(manual, full) {

  if (thread.refreshingThread || (manual && sideCatalog.loadingThread)) {
    return;
  }

  thread.manualRefresh = manual;
  thread.fullRefresh = full;

  if (thread.autoRefresh && manual) {
    clearInterval(thread.refreshTimer);
  }

  thread.refreshButton.disabled = true;

  thread.refreshingThread = true;

  if (api.mod) {
    api.formApiRequest('mod', {}, thread.refreshCallback, true,
        thread.refreshParameters);
  } else {
    api.localRequest(thread.refreshURL, thread.refreshCallback);
  }

};

thread.sendReplyData = function(files, captchaId) {

  var forcedAnon = !document.getElementById('fieldName');
  var hiddenFlags = !document.getElementById('flagsDiv');
  var selectedFlag;
  var typedName;

  if (!hiddenFlags) {
    var combo = document.getElementById('flagCombobox');

    selectedFlag = combo.options[combo.selectedIndex].value;

    postCommon.savedSelectedFlag(selectedFlag);

  }

  if (!forcedAnon) {
    typedName = document.getElementById('fieldName').value.trim();
    if (typedName.length > 0) {
      localStorage.setItem('name', typedName);
    }
  }

  var typedEmail = document.getElementById('fieldEmail').value.trim();
  var typedMessage = document.getElementById('fieldMessage').value.trim();
  var typedSubject = document.getElementById('fieldSubject').value.trim();
  var typedPassword = document.getElementById('fieldPostingPassword').value
      .trim();

  if (!postCommon.belowMaxFileSize(files)) {
    alert("Upload failed: file too large");
    return;
  }

  if (!typedMessage.length && !files.length) {
    alert('A message or a file is mandatory.');
    return;
  } else if (!forcedAnon && typedName.length > 32) {
    alert('Name is too long, keep it under 32 characters.');
    return;
  } else if (typedMessage.length > thread.messageLimit) {
    alert('Message is too long, keep it under ' + thread.messageLimit
        + ' characters.');
    return;
  } else if (typedEmail.length > 64) {
    alert('E-mail is too long, keep it under 64 characters.');
    return;
  } else if (typedSubject.length > 128) {
    alert('Subject is too long, keep it under 128 characters.');
    return;
  } else if (typedPassword.length > 8) {
    alert('Password is too long, keep it under 8 characters.');
    return;
  }

  if (!typedPassword) {
    typedPassword = Math.random().toString(36).substring(2, 10);
  }

  localStorage.setItem('deletionPassword', typedPassword);

  var spoilerCheckBox = document.getElementById('checkboxSpoiler');
  var sageCheckbox = document.getElementById('doSageCheckbox');

  var noFlagCheckBox = document.getElementById('checkboxNoFlag');

  thread.originalButtonText = thread.replyButton.value;
  thread.replyButton.innerText = 'Uploading 0%';
  qr.setQRReplyText(thread.replyButton.innerText);
  thread.replyButton.disabled = true;
  qr.setQRReplyEnabled(false);

  api.formApiRequest('replyThread', {
    name : forcedAnon ? null : typedName,
    flag : hiddenFlags ? null : selectedFlag,
    captcha : captchaId,
    subject : typedSubject,
    noFlag : noFlagCheckBox ? noFlagCheckBox.checked : false,
    spoiler : spoilerCheckBox ? spoilerCheckBox.checked : false,
    password : typedPassword,
    message : typedMessage,
    email : typedEmail,
    sage : sageCheckbox ? sageCheckbox.checked : false,
    files : files,
    boardUri : api.boardUri,
    threadId : api.threadId
  }, thread.replyCallback);

};

//TODO
thread.processFilesToPost = function(captchaId) {

  postCommon.newGetFilesToUpload(function gotFiles(files) {
    thread.sendReplyData(files, captchaId);
  });

};

thread.postReply = function() {

  if (api.hiddenCaptcha) {
    return bypassUtils.checkPass(thread.processFilesToPost);
  }

  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();

  if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {

    alert('Captchas are exactly 6 (112 if no cookies) characters long.');
    return;
  }

  if (typedCaptcha.length == 112) {
    bypassUtils.checkPass(function() {
      thread.processFilesToPost(typedCaptcha);
    });
  } else {
    var parsedCookies = api.getCookies();

    api.formApiRequest('solveCaptcha', {
      captchaId : parsedCookies.captchaid,
      answer : typedCaptcha
    }, function solvedCaptcha(status, data) {

      if (status !== 'ok') {
        alert(status);
        return;
      }

      bypassUtils.checkPass(function() {
        thread.processFilesToPost(parsedCookies.captchaid);
      });

    });
  }

};

thread.transition = function() {

  if (!thread.autoRefresh) {
    return;
  }

  if (thread.wssPort || thread.wsPort) {
    thread.stopWs();
    thread.startWs();
  } else {
    thread.currentRefresh = 5;
  }

};

thread.startTimer = function(time) {
  if (thread.socket && thread.socket.readyState === thread.socket.OPEN) {
    return;
  }

  if (thread.currentRefresh) {
    clearInterval(thread.refreshTimer);
  }

  if (time > 600) {
    time = 600;
  }
  if (!document.hidden) {
    time = active_refresh_time;
  }

  thread.currentRefresh = time;
  thread.lastRefresh = time;
  thread.refreshLabel.innerText = thread.currentRefresh;
  thread.refreshTimer = setInterval(function checkTimer() {

    if (sideCatalog.loadingThread) {
      return;
    }

    thread.currentRefresh--;

    if (thread.currentRefresh < 1) {
      clearInterval(thread.refreshTimer);
      thread.refreshPosts();
      thread.refreshLabel.innerText = '';
    } else {
      thread.refreshLabel.innerText = thread.currentRefresh;
    }

  }, 1000);
};

thread.stopWs = function() {

  if (!thread.socket) {
    return;
  }

  thread.socket.close();
  delete thread.socket;

};

thread.addWsPost = function(data) {

  tooltips.knownPosts[api.boardUri][data.postId] = data;

  var postCell = posting.addPost(data, api.boardUri, api.threadId);

  thread.divPosts.appendChild(postCell);

  thread.lastPost = postCell;

  thread.lastReplyId = data.postId;

};

thread.startWs = function() {

  if (typeof (sideCatalog) !== 'undefined' && sideCatalog.loadingThread) {
    return;
  }

  if (JSON.parse(localStorage.noWs || 'false') || (thread.wsPort || thread.wssPort) === undefined ) {
    thread.wsStatusLabel.style.display = "none";
    thread.autoIndicator.innerText = "Auto";
    return;
  }

  var isOnion = window.location.hostname.endsWith('.onion');
  var protocol = 'ws';
  var portToUse = thread.wsPort;
  
  if (thread.wssPort && location.protocol == 'https:' && !isOnion) {
    protocol = 'wss';
    portToUse = thread.wssPort;
  }

  thread.socket = new WebSocket(protocol + '://' + window.location.hostname
      + ':' + portToUse);

  thread.socket.onopen = function(event) {
    thread.socket.send(api.boardUri + '-' + api.threadId);
    clearInterval(thread.refreshTimer);
    thread.refreshLabel.innerText = '';

    thread.autoIndicator.innerText = "Live updates";

    thread.wsStatusLabel.style.display = "inherit";
	thread.wsStatusLabel.style.color = "green";
    thread.wsStatusLabel.title = "Websocket OK";
  };

  thread.socket.onclose = function() {
    thread.wsStatusLabel.style.color = "red";
    thread.wsStatusLabel.title = "Websocket closed, attempting to reconnect";
    thread.changeRefresh();
  }

  thread.socket.onmessage = function(message) {

    message = JSON.parse(message.data);

    switch (message.action.toLowerCase()) {
    case 'post': {

      if (message.data) {
        return thread.addWsPost(message.data);
      }

      thread.expectedPosts.push(message.target[0]);

      setTimeout(function() {

        if (!thread.refreshingThread) {
          thread.refreshPosts();
        }
      }, 200);

      break;
    }
    case 'edit': {
      setTimeout(function() {
        thread.refreshPosts(null, true);
      }, 200);
      break;
    }
    case 'delete': {

      //filter duplicates
      message.target.filter((val, ind, arr) => arr.indexOf(val) === ind)
      .forEach((target) => {

        var post = document.getElementById(target);

        if (!post) {
          return;
        }

        var info = post.getElementsByClassName('postInfo')[0];

        var deletedLabel = document.createElement('span');
        deletedLabel.innerText = '(Deleted)';

        info.insertBefore(deletedLabel,
          info.getElementsByClassName('linkName')[0]);

        if (!thread.noAutohideDeleted) {
          hiding.hidePost(post.getElementsByClassName("linkSelf")[0], true, true);
        }
        
      });

      break;
    }

    }

  };

  thread.socket.onerror = function(error) {
    delete thread.wsPort;
    delete thread.wssPort;
    thread.changeRefresh();
  };

};

thread.changeRefresh = function() {

  thread.autoRefresh = document.getElementById('checkboxChangeRefresh').checked;
  thread.noAutohideDeleted = JSON.parse(localStorage.noAutohideDeleted || "false");

  if (!thread.autoRefresh) {
    thread.refreshLabel.innerText = '';

    thread.stopWs();

    clearInterval(thread.refreshTimer);
  } else {

    thread.startTimer(5); //will get canceled by onopen anyway

    thread.startWs();
  }

};

thread.deleteFromIp = function() {

  var typedIp = document.getElementById('ipField').value.trim();
  var typedBoards = document.getElementById('fieldBoards').value.trim();

  if (!typedIp.length) {
    alert('An IP is mandatory');
    return;
  }

  api.formApiRequest('deleteFromIp', {
    ip : typedIp,
    boards : typedBoards
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      document.getElementById('ipField').value = '';
      document.getElementById('fieldBoards').value = '';

      alert('Postings deleted.');

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

thread.init();
