//postCommon.js: upload and banning form hookups
var postCommon = {};
var globalMaxSize = 50 * 1024 * 1024;

postCommon.mimeIcons = {
	"video/webm": "/.static/mimethumbs/generic_video.svg",
	"video/mp4": "/.static/mimethumbs/generic_video.svg",
	"audio/ogg": "/.static/mimethumbs/generic_audio.svg",
	"default": "/.static/mimethumbs/generic_file.svg"
}

//TODO: rewrite some of this to cooperate with trashBin(?)
postCommon.init = function() {

  //occurs on pages with a trashFormButton, reportFormButton (i.e., overboard or has an actionsForm)
  if (document.getElementById('deleteFormButton')) {
    api.convertButton('trashFormButton', postCommon.trashPosts);
    api.convertButton('reportFormButton', postCommon.reportPosts, 'reportField');
    api.convertButton('deleteFormButton', postCommon.deletePosts, 'deletionField');
  }

  if (!document.getElementById('fieldPostingPassword')) {
    return;
  }

  Array.from(document.getElementsByClassName("reloadButton")).forEach((reloadButton) => {
    reloadButton.onclick = function() { location.reload() };
  })

  var noCookiesLink = document.getElementById('noCookiesLink');
  if (noCookiesLink && document.cookie) {
    noCookiesLink.style.display = "hidden";
  }

  var charLimitLabel = document.getElementById('labelMessageLength');

  document.getElementById('fieldMessage').addEventListener('input',
      postCommon.updateCurrentChar);

  postCommon.currentCharLabel = document.createElement('span');

  charLimitLabel.parentNode.insertBefore(postCommon.currentCharLabel,
      charLimitLabel);

  charLimitLabel.parentNode.insertBefore(document.createTextNode('/'),
      charLimitLabel);

  postCommon.updateCurrentChar();

  labelScramble = document.getElementById("labelScramble");
  if (labelScramble) {
    var scrambleFiles = document.createElement('input');
    scrambleFiles.type = "checkbox";
    scrambleFiles.id = "checkboxScramble";
    scrambleFiles.className = "postingCheckbox";
    labelScramble.parentNode.insertBefore(scrambleFiles, labelScramble);

    postCommon.scrambleFiles = scrambleFiles;
  }

  postCommon.selectedCell = api.getTemplate("selected-cell-template", true);

  postCommon.selectedFiles = [];
  postCommon.maxFileSize = globalMaxSize;
  var maxSize = document.getElementById("labelMaxFileSize");
  if (maxSize) {
    var parse = maxSize.innerText.split(' ');
    var size = 1;

    for (var i in api.sizeOrders) {
      if (api.sizeOrders[i] == parse[1])
        break;
      size *= 1024;
    }
    postCommon.maxFileSize = (+parse[0]) * size;
  }

  if (document.getElementById('divUpload')) {
    postCommon.setDragAndDrop();
  }

  var savedPassword = localStorage.deletionPassword;

  if (savedPassword) {

    document.getElementById('fieldPostingPassword').value = savedPassword;

    if (document.getElementById('deletionFieldPassword')) {
      document.getElementById('deletionFieldPassword').value = savedPassword;
    }

  }

  var nameField = document.getElementById('fieldName');

  if (nameField) {
    nameField.value = localStorage.name || '';
  }

  //TODO see if these occur together
  var bypassSpan = document.getElementById('alwaysUseBypassSpan');
  var bypassCheckBox = document.getElementById('alwaysUseBypassCheckBox');

  if (bypassSpan) {
    bypassSpan.classList.toggle('hidden');
  }

  if (localStorage.ensureBypass && JSON.parse(localStorage.ensureBypass)) {
    bypassCheckBox.checked = true;
  }

  bypassCheckBox.addEventListener('change', function() {
    localStorage.setItem('ensureBypass', bypassCheckBox.checked);
  });

  var flagCombo = document.getElementById('flagCombobox');

  if (flagCombo && localStorage.savedFlags) {

    var flagInfo = JSON.parse(localStorage.savedFlags);

    if (flagInfo[api.boardUri]) {

      for (var i = 0; i < flagCombo.options.length; i++) {

        if (flagCombo.options[i].value === flagInfo[api.boardUri]) {
          flagCombo.selectedIndex = i;

          postCommon.showFlagPreview(flagCombo);

          break;
        }

      }

    }

  }

  if (flagCombo) {
    postCommon.setFlagPreviews(flagCombo);
  }

  var formMore = document.getElementById('actionsForm');
  
  if (formMore) {
    formMore = formMore.getElementsByClassName('showFormDetails')[0];

    formMore.ontoggle = function() {
      localStorage.setItem('showExtra', formMore.open);
    };

    if (localStorage.showExtra) {
      formMore.open = JSON.parse(localStorage.showExtra);
    }
  }

  // add paste support
  window.addEventListener('paste', function(evt) {

    if (!evt.clipboardData) return;

    var data = Array.from(evt.clipboardData.items).find((i) => i.kind === "file");
    if (!data) return;

    evt.stopPropagation();
    evt.preventDefault();

    var file = data.getAsFile();

    if (file.type.indexOf("image/")
        && file.type.indexOf("video/")
        && file.type.indexOf("audio/")) {
      return;
    }

    // since file names are immutable, this ugly hack is required.
    var ext = file.name.split(".").reverse()[0];
    postCommon.sha256(file).then((hash) => {;

      var mime = file.type;
      var blob = file.slice(0, file.size, mime);

      postCommon.addSelectedFile(new File([blob], hash + '.' + ext, { type: mime }));
    })
  });

};

postCommon.updateCurrentChar = function() {
  postCommon.currentCharLabel.innerText = document
      .getElementById('fieldMessage').value.trim().length;
};

postCommon.showFlagPreview = function(combo) {

  var index = combo.selectedIndex;

  var src;

  if (!index) {
    src = '';
  } else {
    src = '/' + api.boardUri + '/flags/' + combo.options[index].value;
  }

  var previews = document.getElementsByClassName('flagPreview');

  for (var i = 0; i < previews.length; i++) {
    previews[i].src = src;
  }

};

postCommon.setFlagPreviews = function(combo) {

  combo.addEventListener('change', function() {
    postCommon.showFlagPreview(combo);
  });

};

postCommon.savedSelectedFlag = function(selectedFlag) {

  var savedFlagData = localStorage.savedFlags ? JSON
      .parse(localStorage.savedFlags) : {};

  savedFlagData[api.boardUri] = selectedFlag;

  localStorage.setItem('savedFlags', JSON.stringify(savedFlagData));

};

postCommon.addDndCell = function(cell, removeButton) {

  if (postCommon.selectedDivQr) {
    var clonedCell = cell.cloneNode(true);
    clonedCell.getElementsByClassName('removeButton')[0].onclick = removeButton.onclick;
    postCommon.selectedDivQr.appendChild(clonedCell);

    var sourceSpoiler = cell.getElementsByClassName('spoilerCheckBox')[0];
    var destinationSpoiler = clonedCell
        .getElementsByClassName('spoilerCheckBox')[0];

    sourceSpoiler.addEventListener('change', function() {
      if (destinationSpoiler) {
        destinationSpoiler.checked = sourceSpoiler.checked;
      }
    });

    destinationSpoiler.addEventListener('change', function() {
      sourceSpoiler.checked = destinationSpoiler.checked;
    });

  }

  postCommon.selectedDiv.appendChild(cell);

};

postCommon.addSelectedFile = function(file) {

  var cell = document.createElement('div');
  cell.className = 'selectedCell';
  postCommon.selectedCell.cloneInto(cell);

  var nameLabel = cell.getElementsByClassName('nameLabel')[0];
  nameLabel.textContent = file.name;

  var removeButton = cell.getElementsByClassName('removeButton')[0];

  removeButton.onclick = function() {
    var index = postCommon.selectedFiles.indexOf(file);

    if (postCommon.selectedDivQr) {

      for (var i = 0; i < postCommon.selectedDiv.childNodes.length; i++) {
        if (postCommon.selectedDiv.childNodes[i] === cell) {
          postCommon.selectedDivQr
              .removeChild(postCommon.selectedDivQr.childNodes[i]);
        }
      }

    }

    postCommon.selectedDiv.removeChild(cell);

    postCommon.selectedFiles.splice(postCommon.selectedFiles.indexOf(file), 1);
  };

  if (!file.type.indexOf('image/')) {

    var fileReader = new FileReader();

    fileReader.onloadend = function() {

      var dndThumb = document.createElement('img');
      dndThumb.src = fileReader.result;
      dndThumb.className = 'dragAndDropThumb';
      cell.appendChild(dndThumb);

      postCommon.selectedFiles.push(file);
      postCommon.addDndCell(cell, removeButton);

    };

    fileReader.readAsDataURL(file);

  } else {
	var mimeIcon = postCommon.mimeIcons[file.type];
	if (!mimeIcon) {
      mimeIcon = postCommon.mimeIcons["default"];
    }

    var dndThumb = document.createElement('img');
    dndThumb.src = mimeIcon;
    dndThumb.className = 'dragAndDropThumb';
    cell.appendChild(dndThumb);

    postCommon.selectedFiles.push(file);
    postCommon.addDndCell(cell, removeButton);
  }

};

postCommon.clearSelectedFiles = function() {

  if (!document.getElementById('divUpload')) {
    return;
  }

  postCommon.selectedFiles = [];

  while (postCommon.selectedDiv.firstChild) {
    postCommon.selectedDiv.removeChild(postCommon.selectedDiv.firstChild);
  }

  if (postCommon.selectedDivQr) {
    while (postCommon.selectedDivQr.firstChild) {
      postCommon.selectedDivQr.removeChild(postCommon.selectedDivQr.firstChild);
    }
  }

};

postCommon.setDragAndDrop = function(qr) {

  var fileInput = document.getElementById('inputFiles');

  if (postCommon.selectedCell === undefined) {
    throw "Could not find drag and drop cell template!";
  }

  if (!qr) {
    fileInput.style.display = 'none';
    document.getElementById('dragAndDropDiv').style.display = 'block';

    fileInput.onchange = function() {

      for (var i = 0; i < fileInput.files.length; i++) {
        postCommon.addSelectedFile(fileInput.files[i]);
      }

      fileInput.type = "text";
      fileInput.type = "file";
    };
  }

  var drop = document.getElementById(qr ? 'dropzoneQr' : 'dropzone');
  drop.onclick = function() {
    fileInput.click();
  };

  if (!qr) {
    postCommon.selectedDiv = document.getElementById('selectedDiv');
  } else {
    postCommon.selectedDivQr = document.getElementById('selectedDivQr');
  }

  drop.addEventListener('dragover', function handleDragOver(event) {

    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';

  }, false);

  drop.addEventListener('drop', function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    for (var i = 0; i < evt.dataTransfer.files.length; i++) {
      postCommon.addSelectedFile(evt.dataTransfer.files[i])
    }

  }, false);

};

postCommon.sha256 = async function(file) {
  var reader = new FileReader();

  reader.readAsArrayBuffer(file);
  await api.asyncify(reader, "onloadend");

  if (crypto.subtle) {

    var hashBuffer = await crypto.subtle.digest('SHA-256', reader.result);

    var hashArray = Array.from(new Uint8Array(hashBuffer));

    var hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  } else {
    
    var i8a = new Uint8Array(reader.result);
    var a = [];

    for (var i = 0; i < i8a.length; i += 4) {
      a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
    }

    var wordArray = CryptoJS.lib.WordArray.create(a, i8a.length);
    var hashHex = CryptoJS.SHA256(wordArray).toString();
  }

  return hashHex;
}

postCommon.newCheckExistence = async function(file) {
  var hashHex = await postCommon.sha256(file);

  //confusing? yes, but necessary for async
  var ret = await new Promise((resolve, reject) => {
    api.formApiRequest('checkFileIdentifier', {},
      (status, data) => {
        if (status !== 'ok') {
          console.log(data);
          reject();
        } else {
          resolve({
            sha256 : hashHex,
            mime : file.type,
            found: data
          });
        }
      },
      false, { identifier : hashHex}
    );
  })

  return ret;
};

postCommon.newGetFilesToUpload = function(callback) {

  if (!document.getElementById('divUpload')
      || !postCommon.selectedFiles) {
    callback([]);
    return;
  }

  (async function(){

    var files = [];

    var spoilers = postCommon.selectedDiv
        .getElementsByClassName('spoilerCheckBox');

    for (var i in postCommon.selectedFiles) {
      var file = postCommon.selectedFiles[i];
      var spoiler = spoilers[i];

      var existence = await postCommon.newCheckExistence(file, callback);

      if (!existence.found) {
        existence.content = file;
        delete existence.found;
      }

      if (postCommon.scrambleFiles.checked) {
        var extension = file.name.substr(file.name.lastIndexOf('.'));
        existence.name = existence.sha256 + extension;
      } else {
        existence.name = file.name;
      }
      existence.spoiler = spoiler.checked;
      existence.cell = spoiler.parentNode.parentNode;

      files.push(existence);
    }

    return files;
  })().then((files) => callback(files));
  
};

postCommon.belowMaxFileSize = function(files) {
  return files.reduce((acc, file) => {
    if (file.content && file.content.size > postCommon.maxFileSize) {
      file.cell.style.backgroundColor = "red";
      acc = false;
    }
    delete file.cell;
    return acc;
  }, true);
};

postCommon.displayBlockBypassPrompt = function(callback) {

  var outerPanel = interfaceUtils.getModal('You need a block bypass to post');

  var modalForm = outerPanel.getElementsByClassName('modalForm')[0];

  modalForm.onsubmit = function(e) {
	e.preventDefault();

    var typedCaptcha = outerPanel.getElementsByClassName('modalAnswer')[0].value
        .trim();

    if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
      alert('Captchas are exactly 6 (112 if no cookies) characters long.');
      return;
    } 

    api.formApiRequest('renewBypass', {
      captcha : typedCaptcha
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        if (api.getCookies().bypass.length <= 372) {

          outerPanel.remove();

          if (callback) {
            callback();
          }

          return;

        }

        if (!crypto.subtle || JSON.parse(localStorage.noJsValidation || 'false')) {
          outerPanel.remove();
          return bypassUtils.showNoJsValidation(callback);
        }


        var okButton = outerPanel.getElementsByClassName('modalOkButton')[0];
        okButton.value = 'Please wait for validation';
        okButton.disabled = true;

        var tempCallback = function(status, data) {

          if (status === 'ok') {
            if (callback) {
              callback();
            }
          } else {
            alert(status + ': ' + JSON.stringify(data));
          }

        };

        tempCallback.stop = function() {
          outerPanel.remove();

        };

        bypassUtils.runValidation(tempCallback);

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  };

};

postCommon.storeUsedPostingPassword = function(boardUri, threadId, postId) {

  var storedData = JSON.parse(localStorage.postingPasswords || '{}');

  var key = boardUri + '/' + threadId

  if (postId) {
    key += '/' + postId;
  }

  storedData[key] = localStorage.deletionPassword;

  localStorage.setItem('postingPasswords', JSON.stringify(storedData));

};

postCommon.newGetSelectedContent = function(object) {

  var checkBoxes = document.getElementsByClassName('deletionCheckBox');

  for (var i = 0; i < checkBoxes.length; i++) {
    var checkBox = checkBoxes[i];

    if (checkBox.checked) {
      object[checkBox.name] = true;
    }
  }

};

postCommon.applyBans = function(captcha, banDelete) {

  var typedReason = document.getElementById('fieldBanReason').value.trim();
  var typedDuration = document.getElementById('fieldDuration').value.trim();
  var typedMessage = document.getElementById('fieldbanMessage').value.trim();
  var banType = document.getElementById('comboBoxBanTypes').selectedIndex;

  var params = {
    action : banDelete ? 'ban-delete' : 'ban',
    reasonBan : typedReason,
    captchaBan : captcha,
    banType : banType,
    duration : typedDuration,
    banMessage : typedMessage,
    nonBypassable : document.getElementById('checkBoxNonBypassable').checked,
    globalBan : document.getElementById('checkboxGlobalBan').checked
  };

  postCommon.newGetSelectedContent(params);

  api.formApiRequest('contentActions', params, function requestComplete(status,
      data) {

    if (status === 'ok') {
      alert('Bans applied');
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });
};

postCommon.banDeletePosts = function() {
  postCommon.banPosts(true);
};

postCommon.banPosts = function(banDelete) {

  if (!document.getElementsByClassName('divBanCaptcha').length) {
    return postCommon.applyBans();
  }

  var typedCaptcha = document.getElementById('fieldCaptchaBan').value.trim();

  if (typedCaptcha.length == 112 || !typedCaptcha) {
    postCommon.applyBans(typedCaptcha);
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

      postCommon.applyBans(parsedCookies.captchaid, banDelete);
    });
  }

};

postCommon.deleteFromIpOnThread = function() {
  postCommon.deleteFromIpOnBoard(null, true);
};

postCommon.deleteFromIpOnBoard = function(event, onThread) {

  var checkBoxes = document.getElementsByClassName('deletionCheckBox');

  for (var i = 0; i < checkBoxes.length; i++) {
    var checkBox = checkBoxes[i];

    if (checkBox.checked) {
      var splitName = checkBox.name.split('-')[0];
      break;
    }

  }

  if (!splitName) {
    return;
  }

  var redirect = '/' + splitName + '/';

  var confirmationBox = document
      .getElementById('ipDeletionConfirmationCheckbox');

  var param = {
    action : onThread ? 'thread-ip-deletion' : 'ip-deletion',
    confirmation : confirmationBox.checked
  };

  postCommon.newGetSelectedContent(param);

  api.formApiRequest('contentActions', param, function requestComplete(status,
      data) {

    if (status === 'ok') {
      window.location.pathname = redirect;
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postCommon.spoilFiles = function() {

  var posts = {
    action : 'spoil'
  };

  postCommon.newGetSelectedContent(posts);

  api.formApiRequest('contentActions', posts, function requestComplete(status,
      data) {

    if (status === 'ok') {

      alert('Files spoiled');

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postCommon.reportPosts = function() {

  var typedReason = document.getElementById('reportFieldReason').value.trim();

  if (!api.noReportCaptcha) {
    var typedCaptcha = document.getElementById('fieldCaptchaReport').value
        .trim();

    if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
      alert('Captchas are exactly 6 (112 if no cookies) characters long.');
      return;
    }
  }

  var reportCategories = document.getElementById('reportComboboxCategory');

  if (reportCategories) {

    var category = reportCategories.options[reportCategories.selectedIndex].value;

  }

  var params = {
    action : 'report',
    categoryReport : category,
    reasonReport : typedReason,
    captchaReport : typedCaptcha,
    globalReport : document.getElementById('checkboxGlobalReport').checked,
  };

  postCommon.newGetSelectedContent(params);

  api.formApiRequest('contentActions', params, function reported(status, data) {

    if (status === 'ok') {

      alert('Content reported');

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

};

postCommon.trashPosts = function() {
  postCommon.deletePosts(null, true);
};

postCommon.deletePosts = function(event, trash) {

  var typedPassword = document.getElementById('deletionFieldPassword').value
      .trim();

  var params = {
    password : typedPassword,
    deleteMedia : document.getElementById('checkboxMediaDeletion').checked,
    deleteUploads : document.getElementById('checkboxOnlyFiles').checked,
    action : trash ? 'trash' : 'delete'
  };

  postCommon.newGetSelectedContent(params);

  api.formApiRequest('contentActions', params, function requestComplete(status,
      data) {

    if (status === 'ok') {

      alert(data.removedThreads + ' threads and ' + data.removedPosts
          + ' posts were successfully deleted.');

      if (typeof latestPostings !== 'undefined') {

        var checkBoxes = document.getElementsByClassName('deletionCheckBox');

        for (var i = checkBoxes.length - 1; i >= 0; i--) {
          var checkBox = checkBoxes[i];

          if (checkBox.checked) {
            checkBox.parentNode.parentNode.parentNode.remove();
          }

        }

      } else if (window.location.toString().indexOf('trashBin.js' >= 0)) {
        location.reload(true);
      } else if (!api.isBoard && !data.removedThreads && data.removedPosts) {
        thread.refreshPosts(true, true);
      } else if (data.removedThreads || data.removedPosts) {
        window.location.pathname = '/';
      }

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

postCommon.init();
