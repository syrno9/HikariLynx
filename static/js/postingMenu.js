//TODO this script has some *heavy* function signatures. some of these could be
//freshened up by sending the callbacks `post` objects from posting, while some
//seem to have too many options for their own good.
var postingMenu = {};

postingMenu.init = function() {

  postingMenu.banLabels = [ 'IP/Bypass ban', 'Range ban (1/2 octets)',
      'Range ban (3/4 octets)', 'ASN ban', 'IP/Bypass warning' ];
  postingMenu.deletionOptions = [ 'Do not delete', 'Delete post',
      'Delete post and media', 'Delete by ip/bypass' ];
  postingMenu.threadSettingsList = [ {
    label : 'Toggle Lock',
    field : 'locked',
    parameter : 'lock'
  }, {
    label : 'Toggle Autosage',
    field : 'autoSage',
    parameter : 'bumplock'
  }, {
    label : 'Toggle Pin',
    field : 'pinned',
    parameter : 'pin'
  }, {
    label : 'Toggle Cyclic',
    field : 'cyclic',
    parameter : 'cyclic'
  } ];

  api.formApiRequest('account', {}, function gotLoginData(status, data) {

    if (status !== 'ok') {
      return;
    }

    postingMenu.loggedIn = true;

    postingMenu.globalRole = data.globalRole;
    postingMenu.noBanCaptcha = data.noCaptchaBan;

    postingMenu.moddedBoards = [];

    for (var i = 0; i < data.ownedBoards.length; i++) {
      postingMenu.moddedBoards.push(data.ownedBoards[i]);
    }

    for (i = 0; i < data.volunteeredBoards.length; i++) {
      postingMenu.moddedBoards.push(data.volunteeredBoards[i]);
    }

    // redo the dropdowns
    // ideally, the user should keep a cookie so that this doesn't have to happen
    posting.existingPosts.forEach(post => {
      post.innerPost.getElementsByClassName("extraMenuButton")[0].remove();
      var newButton = interfaceUtils.addMenuDropdown(post, "Post Menu", 
        "extraMenuButton", postingMenu.buildMenu);
      // preserve button order
      newButton.parentNode.insertBefore(newButton, newButton.nextSibling.nextSibling);
    });

  }, {}, true);

};

postingMenu.showReport = function(board, thread, post, global) {

  var outerPanel = interfaceUtils.getModal(global ? 'Global report'
      : 'Report', api.noReportCaptcha);

  var reasonField = document.createElement('input');
  reasonField.type = 'text';

  var categories = document.getElementById('reportComboboxCategory');

  if (categories) {

    var newCategories = categories.cloneNode(true);
    newCategories.id = null;

  }

  var modalForm = outerPanel.getElementsByClassName('modalForm')[0];

  modalForm.onsubmit = function(e) {
	e.preventDefault();

    if (!api.noReportCaptcha) {

      var typedCaptcha = outerPanel.getElementsByClassName('modalAnswer')[0].value
          .trim();

      if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
        alert('Captchas are exactly 6 (112 if no cookies) characters long.');
        return;
      }
    }

    var params = {
      captchaReport : typedCaptcha,
      reasonReport : reasonField.value.trim(),
      globalReport : global,
      action : 'report'
    };

    if (categories) {
      params.categoryReport = newCategories.options[newCategories.selectedIndex].value;
    }

    var key = board + '-' + thread;

    if (post && thread !== post) {
      key += '-' + post;
    }

    params[key] = true;

    api.formApiRequest('contentActions', params, function(
        status, data) {

      if (status === 'ok') {
        outerPanel.remove();
      } else {
        alert(status + ': ' + JSON.stringify(data));
      }

    });

  };

  interfaceUtils.addModalRow('Reason', reasonField);
  if (categories) {
    interfaceUtils.addModalRow('Category', newCategories);
  }

};

postingMenu.deleteSinglePost = function(boardUri, threadId, post, fromIp,
    unlinkFiles, wipeMedia, innerPart, forcedPassword, onThread, trash) {

  var key = boardUri + '/' + threadId

  if (post !== threadId) {
    key += '/' + post;
  }

  var storedData = JSON.parse(localStorage.postingPasswords || '{}');

  var delPass = document.getElementById('deletionFieldPassword');

  if (delPass) {
    delPass = delPass.value.trim();
  }

  var password = forcedPassword || storedData[key]
      || localStorage.deletionPassword || delPass
      || Math.random().toString(36).substring(2, 10);

  var selectedAction;

  if (trash) {
    selectedAction = 'trash';
  } else if (fromIp) {
    selectedAction = onThread ? 'thread-ip-deletion' : 'ip-deletion';
  } else {
    selectedAction = 'delete';
  }

  var params = {
    confirmation : true,
    password : password,
    deleteUploads : unlinkFiles,
    deleteMedia : wipeMedia,
    action : selectedAction
  };

  var key = boardUri + '-' + threadId;

  if (post !== threadId) {
    key += '-' + post;
  }

  params[key] = true;

  var deletionCb = function(status, data) {

    if (status !== 'ok') {
      alert(status + ': ' + JSON.stringify(data));
      return;
    }

    var data = data || {};

    var removed = data.removedThreads || data.removedPosts;

    if (unlinkFiles && removed) {
      innerPart.getElementsByClassName('panelUploads')[0].remove();
    } else if (fromIp) {

      if (api.isBoard || !api.boardUri) {
        location.reload(true);
      } else {
        window.location.pathname = '/' + boardUri + '/';
      }

    } else if (api.threadId && data.removedThreads) {
      window.location.pathname = '/' + boardUri + '/';
    } else if (removed) {

      if (typeof (reports) !== 'undefined') {
        innerPart.parentNode.parentNode.remove();
      } else {
        innerPart.parentNode.remove();
      }

    } else if (!removed) {

      var newPass = prompt('Could not delete. Would you like to try another password?');

      if (newPass) {
        postingMenu.deleteSinglePost(boardUri, threadId, post, fromIp,
            unlinkFiles, wipeMedia, innerPart, newPass, onThread, trash);
      }

    }

  };

  api.formApiRequest('contentActions', params, deletionCb);

};

postingMenu.applySingleBan = function(typedMessage, deletionOption,
    typedReason, typedCaptcha, banType, typedDuration, global, nonBypassable,
    boardUri, thread, post, innerPart, outerPanel) {

  localStorage.setItem('autoDeletionOption', deletionOption);

  var params = {
    action : deletionOption === 1 ? 'ban-delete' : 'ban',
    nonBypassable : nonBypassable,
    reasonBan : typedReason,
    captchaBan : typedCaptcha,
    banType : banType,
    duration : typedDuration,
    banMessage : typedMessage,
    globalBan : global
  };

  var key = boardUri + '-' + thread;

  if (post !== thread) {
    key += '-' + post;
  }

  params[key] = true;

  api.formApiRequest('contentActions', params, function(status,
      data) {

    if (status === 'ok') {

      var banMessageDiv = innerPart.getElementsByClassName('divBanMessage')[0];

      if (!banMessageDiv) {
        banMessageDiv = document.createElement('div');
        banMessageDiv.className = 'divBanMessage';
        innerPart.appendChild(banMessageDiv);
      }

      //XXX make sure that banMessages don't have preformatted HTML
      banMessageDiv.innerText = typedMessage
          || postingMenu.defaultBanMessage(banType);

      outerPanel.remove();

      if (deletionOption > 1) {
        postingMenu.deleteSinglePost(boardUri, thread, post,
            deletionOption === 3, false, deletionOption === 2, innerPart);
      } else if (deletionOption) {
        innerPart.parentNode.remove();
      }

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });


};

//FIXME the backend should send its defaults in the response to contentForms
postingMenu.defaultBanMessage = function(banType) {
  switch (banType) {
    case 4:
      return '(USER WAS WARNED FOR THIS POST)';
	default:
      return '(USER WAS BANNED FOR THIS POST)';
  }
}

postingMenu.banSinglePost = function(innerPart, boardUri, thread, post, global) {

  var useCaptcha = !(postingMenu.globalRole < 4 || postingMenu.noBanCaptcha);
  var outerPanel = interfaceUtils.getModal(global ? 'Global ban' : 'Ban',
      !useCaptcha);

  var modalForm = outerPanel.getElementsByClassName('modalForm')[0];

  var reasonField = document.createElement('input');
  reasonField.type = 'text';

  var durationField = document.createElement('input');
  durationField.type = 'text';

  var messageField = document.createElement('input');
  messageField.type = 'text';

  var typeCombo = document.createElement('select');

  for (var i = 0; i < postingMenu.banLabels.length; i++) {

    var option = document.createElement('option');
    option.innerText = postingMenu.banLabels[i];
    typeCombo.appendChild(option);

  }

  var deletionCombo = document.createElement('select');

  for (var i = 0; i < postingMenu.deletionOptions.length; i++) {

    var option = document.createElement('option');
    option.innerText = postingMenu.deletionOptions[i];
    deletionCombo.appendChild(option);

  }

  deletionCombo.selectedIndex = +localStorage.autoDeletionOption;

  var captchaField = outerPanel.getElementsByClassName('modalAnswer')[0];
  if (useCaptcha) {
    captchaField = outerPanel.getElementsByClassName('modalAnswer')[0];
  }
  //captchaField.setAttribute('placeholder', 'only for board staff)');

  var nonBypassableCheckbox = document.createElement('input');
  nonBypassableCheckbox.type = 'checkbox';

  modalForm.onsubmit = function(e) {
	e.preventDefault();
    postingMenu.applySingleBan(messageField.value.trim(),
        deletionCombo.selectedIndex, reasonField.value.trim(), useCaptcha
        	&& captchaField.value.trim(), typeCombo.selectedIndex,
			durationField.value.trim(), global, nonBypassableCheckbox.checked,
			boardUri, thread, post, innerPart, outerPanel);
  };

  interfaceUtils.addModalRow('Reason', reasonField);
  interfaceUtils.addModalRow('Duration', durationField);
  interfaceUtils.addModalRow('Message', messageField);
  interfaceUtils.addModalRow('Type', typeCombo);
  interfaceUtils.addModalRow('Deletion action', deletionCombo);
  interfaceUtils.addModalRow('Non-bypassable', nonBypassableCheckbox);

};

postingMenu.spoilSinglePost = function(innerPart, boardUri, thread, post) {

  var params = {
    action : 'spoil'
  };

  var key = boardUri + '-' + thread;

  if (post !== thread) {
    key += '-' + post;
  }

  params[key] = true;

  api.formApiRequest('contentActions', params, function(status,
      data) {

    // style exception, too simple
    api.localRequest('/' + boardUri + '/res/' + thread + '.json', function(
        error, data) {

      if (error) {
        return;
      }

      var thumbs = innerPart.getElementsByClassName('imgLink');

      for (var i = 0; i < thumbs.length; i++) {
        thumbs[i].childNodes[0].src = '/spoiler.png';
      }

    });

  });

};

postingMenu.mergeThread = function(board, thread) {

  var destination = prompt('Merge with which thread?', 'Thread id');

  if (!destination) {
    return;
  }

  destination = destination.trim();

  api.formApiRequest('mergeThread', {
    boardUri : board,
    threadSource : thread,
    threadDestination : destination
  }, function transferred(status, data) {

    if (status === 'ok') {
      window.location.pathname = '/' + board + '/res/' + destination + '.html';
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postingMenu.transferThread = function(boardUri, thread) {

  var destination = prompt('Transfer to which board?',
      'Board uri without slashes');

  if (!destination) {
    return;
  }

  destination = destination.trim();

  api.formApiRequest('transferThread', {
    boardUri : boardUri,
    threadId : thread,
    boardUriDestination : destination
  }, function transferred(status, data) {

    if (status === 'ok') {
      window.location.pathname = '/' + destination + '/res/' + data + '.html';
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postingMenu.updateEditedPosting = function(board, thread, post, innerPart, data) {

  innerPart.getElementsByClassName('divMessage')[0].innerHTML = data.markdown;

  var subjectLabel = innerPart.getElementsByClassName('labelSubject')[0];

  if (!subjectLabel && data.subject) {

    var pivot = innerPart.getElementsByClassName('linkName')[0];

    subjectLabel = document.createElement('span');
    subjectLabel.className = 'labelSubject';
    pivot.parentNode.insertBefore(subjectLabel, pivot);

    pivot.parentNode.insertBefore(document.createTextNode(' '), pivot);

  } else if (subjectLabel && !data.subject) {
    subjectLabel.remove();
  }

  if (data.subject) {
    subjectLabel.innerText = data.subject;
  }

};

postingMenu.getNewEditData = function(board, thread, post, innerPart) {

  api.localRequest('/' + board + '/res/' + thread + '.json', function(error,
      data) {

    if (error) {
      return;
    }

    data = JSON.parse(data);

    if (post !== thread) {

      for (var i = 0; i < data.posts.length; i++) {
        if (data.posts[i].postId === +post) {
          data = data.posts[i];
          break;
        }
      }

    }

    postingMenu.updateEditedPosting(board, thread, post, innerPart, data);

  });

};

postingMenu.editPost = function(board, thread, post, innerPart) {

  var parameters = {
    boardUri : board,
    threadId : thread
  };

  if (post !== thread) {
    parameters.postId = post;
  }

  api.formApiRequest('edit', {}, function gotData(status, data) {

    if (status !== 'ok') {
      alert(status);
      return;
    }

    var outerPanel = interfaceUtils.getModal('Edit', true);

    var okButton = outerPanel.getElementsByClassName('modalOkButton')[0];

    var subjectField = document.createElement('input');
    subjectField.type = 'text';
    subjectField.value = data.subject || '';

    var messageArea = document.createElement('textarea');
    messageArea.setAttribute('rows', '5');
    messageArea.setAttribute('cols', '35');
    messageArea.setAttribute('placeholder', 'message');
    messageArea.defaultValue = data.message || '';

    okButton.onclick = function(e) {
      e.preventDefault();

      var typedSubject = subjectField.value.trim();
      var typedMessage = messageArea.value.trim();

      if (typedSubject.length > 128) {
        alert('Subject too long, keep it under 128 characters.');
      } else if (!typedMessage.length) {
        alert('A message is mandatory.');
      } else {

        var parameters = {
          boardUri : board,
          message : typedMessage,
          subject : typedSubject
        };

        if (post !== thread) {
          parameters.postId = post;
        } else {
          parameters.threadId = thread;
        }

        // style exception, too simple
        api.formApiRequest('saveEdit', parameters, function(
            status, data) {

          if (status === 'ok') {
            outerPanel.remove();
            postingMenu.getNewEditData(board, thread, post, innerPart);
          } else {
            alert(status + ': ' + JSON.stringify(data));
          }
        });
      }

    };

    interfaceUtils.addModalRow('Subject', subjectField);
    interfaceUtils.addModalRow('Message', messageArea);

  }, false, parameters);

};

postingMenu.toggleThreadSetting = function(boardUri, thread, settingIndex,
    innerPart) {

  /* Note to self: why does this script in particular not look at 
   * the Indicator elements? Does it appear on some page without them? 
   * Getting fresh data isn't the best idea: moderators want to toggle
   * what they see, not what the current state actually is */
  api.localRequest('/' + boardUri + '/res/' + thread + '.json',
      function gotData(error, data) {

        if (error) {
          alert(error);
          return;
        }

        var data = JSON.parse(data);

        var parameters = {
          boardUri : boardUri,
          threadId : thread
        };

        for (var i = 0; i < postingMenu.threadSettingsList.length; i++) {

          var field = postingMenu.threadSettingsList[i];

          parameters[field.parameter] = settingIndex === i ? !data[field.field]
              : data[field.field];

        }

        api.formApiRequest('changeThreadSettings', parameters,
            function(status, data) {

              if (status === 'ok') {
                api.resetIndicators({
                  locked : parameters.lock,
                  bumplock : parameters.bumplock,
                  pinned : parameters.pin,
                  cyclic : parameters.cyclic,
                  archived : innerPart
                      .getElementsByClassName('archiveIndicator').length
                }, innerPart);
              } else {
                alert(status + ': ' + JSON.stringify(data));
              }
            });

      });

};

postingMenu.addToggleSettingButton = function(extraMenu, board, thread, index,
    innerPart) {

  extraMenu.appendChild(document.createElement('hr'));

  var toggleButton = document.createElement('div');
  toggleButton.innerText = postingMenu.threadSettingsList[index].label;
  toggleButton.onclick = function() {
    postingMenu.toggleThreadSetting(board, thread, index, innerPart);
  };

  extraMenu.appendChild(toggleButton);

};

postingMenu.sendArchiveRequest = function(board, thread, innerPart) {

  api.formApiRequest('archiveThread', {
    confirmation : true,
    boardUri : board,
    threadId : thread
  }, function(status, data) {

    if (status === 'ok') {

      if (!api.threadId) {
        innerPart.parentNode.remove();
        return;
      }

      var lock = innerPart.getElementsByClassName('lockIndicator').length;
      var autosage = innerPart.getElementsByClassName('bumpLockIndicator').length;
      var pin = innerPart.getElementsByClassName('pinIndicator').length;
      var cyclic = innerPart.getElementsByClassName('cyclicIndicator').length;

      api.resetIndicators({
        locked : lock,
        bumplock : autosage,
        pinned : pin,
        cyclic : cyclic,
        archived : true
      }, innerPart);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

};

postingMenu.setExtraMenuThread = function(post, menuCallbacks) {

  if (postingMenu.globalRole <= 1) {
	menuCallbacks.push(
	  {name: 'Transfer Thread'
	  ,callback: function() {
        postingMenu.transferThread(post.postInfo.board, post.postInfo.thread);
	  }}
	)
  }

  postingMenu.threadSettingsList.forEach(function(entry, i) {
	menuCallbacks.push(
	  {name: entry.label
	  ,callback: function() {
        //TODO
		postingMenu.toggleThreadSetting(post.postInfo.board, post.postInfo.thread,
          i, post.innerPost);
	  }}
	)
  })

  if (post.innerPost.getElementsByClassName('archiveIndicator').length) {
    return;
  }

  var newCallbacks = [
	  {name: 'Archive'
	  ,callback: function() {
		if (confirm("Are you sure you wish to lock and archive this thread?")) {
		  postingMenu.sendArchiveRequest(post.postInfo.board,
            post.postInfo.thread, post.innerPost);
		}
	  }},
	  {name: 'Merge'
	  ,callback: function() {
    	postingMenu.mergeThread(post.postInfo.board, post.postInfo.thread);
	  }},
  ]

  Array.prototype.push.apply(menuCallbacks, newCallbacks)

};

postingMenu.setModFileOptions = function(post, menuCallbacks) {

  menuCallbacks.push(
	{name: 'Spoil Files'
	,callback: function() {
      postingMenu.spoilSinglePost(post.innerPost, post.postInfo.board,
        post.postInfo.thread, post.postInfo.post);
 	}},
  )

  if (postingMenu.globalRole > 3) {
    return;
  }

  menuCallbacks.push(
	{name: 'Delete Post And Media'
	,callback: function() {
      postingMenu.deleteSinglePost(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post, false, false, true, post.innerPost);
 	}},
  )
};

postingMenu.setExtraMenuMod = function(post, menuCallbacks, hasFiles) {

  if (hasFiles) {
	//TODO
    postingMenu.setModFileOptions(post, menuCallbacks);
  }

  var newCallbacks = [
	{name: 'Trash Post'
    ,callback: function() {
      postingMenu.deleteSinglePost(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post, null, null, null, post.innerPost, null, null, true);
    }},
    {name: 'Unlink Files'
    ,callback: function() {
      postingMenu.deleteSinglePost(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post, false, true, null, post.innerPost);
    }},
	{name: 'Delete By IP/bypass'
	,callback: function() {
	  if (confirm("Are you sure you wish to delete all posts on this board made by this IP/bypass?")) {
	    postingMenu.deleteSinglePost(post.postInfo.board, post.postInfo.thread,
          post.postInfo.post, true, null, null, post.innerPost);
	  }
 	}},
	{name: 'Ban'
	,callback: function() {
      postingMenu.banSinglePost(post.innerPost, post.postInfo.board,
        post.postInfo.thread, post.postInfo.post);
 	}},
	{name: 'Global Ban'
	,callback: function() {
      postingMenu.banSinglePost(post.innerPost, post.postInfo.board,
        post.postInfo.thread, post.postInfo.post, true);
 	}},
	{name: 'Edit'
	,callback: function() {
      postingMenu.editPost(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post, post.innerPost);
 	}}
  ]

  //remove global ban for global janitors
  if (postingMenu.globalRole > 2) {
	newCallbacks.splice(4, 1);
  }

  Array.prototype.push.apply(menuCallbacks, newCallbacks);

  if (post.postInfo.op) {
	//TODO
    postingMenu.setExtraMenuThread(post, menuCallbacks);
  }

};

postingMenu.buildMenu = function(post, extraMenu) {

  var menuCallbacks = [
    {name: 'Report'
    ,callback: function() {
      postingMenu.showReport(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post);
    }},
    {name: 'Global Report'
    ,callback: function() {
      postingMenu.showReport(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post, true);
    }},
    //TODO:	'Remove Post' means that a user deletes their own post 
    // 		'Delete Post' means that a moderator purges the post immediately
    {name: 'Delete Post'
    ,callback: function() {
      postingMenu.deleteSinglePost(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post, null, null, null, post.innerPost);
    /*}},
    //TODO: allow users to unlink files they uploaded
    {name: 'Unlink Files'
    ,callback: function() {
      postingMenu.deleteSinglePost(post.postInfo.board, post.postInfo.thread,
        post.postInfo.post, false, true, null, post.innerPost);
    */
    }}
  ]

  var hasFiles = post.files && post.files.children.length > 0;

  /*
  if (!hasFiles) {
	menuCallbacks.pop();
  }
  */

  if (postingMenu.loggedIn && (postingMenu.globalRole < 4 
    || postingMenu.moddedBoards.indexOf(post.postInfo.board) >= 0)) {

    postingMenu.setExtraMenuMod(post, menuCallbacks, hasFiles);
  }

  return menuCallbacks;
};

postingMenu.init();
