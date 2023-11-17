api.isBoard = true;

var board = {};

board.init = function() {

  api.mod = !!document.getElementById('divMod');
  api.hiddenCaptcha = !document.getElementById('captchaDiv');

  var identifierElement = document.getElementById('boardIdentifier');
  var sageSpan = document.getElementById('useSageSpan')
  api.boardUri = identifierElement ? identifierElement.value : null;

  if (!api.boardUri) {

    var altIdentifierElement = document.getElementById('labelBoard');

    api.boardUri = altIdentifierElement ? altIdentifierElement.innerText
        .replace(/\//g, '') : null;

    var archiveTarget = document.location.toString().split('/');
    archiveTarget.pop()
    var archiveLink = document.getElementById('archiveLinkBoard');
    archiveLink.href = 'http://archive.today/' + encodeURIComponent(archiveTarget.join('/')) + '/*';
    archiveLink.parentNode.style.display = 'inline-block';

  }

  if (sageSpan)
	sageSpan.classList.add('hidden');

  if (identifierElement) {

    board.messageLimit = +document.getElementById('labelMessageLength').innerText;

    board.postButton = document.getElementById('formButton');

    board.postingForm = document.getElementById('postingFormContents').parentNode;
    board.postingForm.onsubmit = function(e) {
      e.preventDefault()
      board.postThread();
    }
  }

  if (api.mod) {
    api.convertButton('inputBan', postCommon.banPosts, 'banField');
    api.convertButton('inputBanDelete', postCommon.banDeletePosts, 'banField');
    api.convertButton('inputIpDelete', postCommon.deleteFromIpOnBoard);
    api.convertButton('inputThreadIpDelete', postCommon.deleteFromIpOnThread);
    api.convertButton('inputSpoil', postCommon.spoilFiles);
  }

  var logLink = document.getElementById('linkLogs');
  if (logLink !== undefined) {
    logLink = logLink.href;
    Array.from(document.getElementsByClassName('linkLogs')).forEach((a) => {
      a.href = logLink;
    })
  }

  var divPages = document.getElementById('divPages');
  if (divPages && api.mobile) {
    board.makeMobilePageList(divPages);
  }

};

board.postCallback = function(status, data) {

  if (status === 'ok') {

    postCommon.storeUsedPostingPassword(api.boardUri, data);
    api.addYou(api.boardUri, data);

    window.location.pathname = '/' + api.boardUri + '/res/' + data + '.html';
  } else {
    alert(status + ': ' + JSON.stringify(data));
  }
};

board.postCallback.stop = function() {
  board.postButton.innerText = board.originalButtonText;
  board.postButton.disabled = false;
};

board.postCallback.progress = function(info) {

  if (info.lengthComputable) {
    var newText = 'Uploading ' + Math.floor((info.loaded / info.total) * 100)
        + '%';
    board.postButton.innerText = newText;
  }
};

board.sendThreadData = function(files, captchaId) {

  var hiddenFlags = !document.getElementById('flagsDiv');

  if (!hiddenFlags) {
    var combo = document.getElementById('flagCombobox');

    var selectedFlag = combo.options[combo.selectedIndex].value;

    postCommon.savedSelectedFlag(selectedFlag);
  }

  var forcedAnon = !document.getElementById('fieldName');

  if (!forcedAnon) {
    var typedName = document.getElementById('fieldName').value.trim();

    localStorage.setItem('name', typedName);

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
  if (!typedMessage.length) {
    alert('A message is mandatory.');
    return;
  } else if (!forcedAnon && typedName.length > 32) {
    alert('Name is too long, keep it under 32 characters.');
    return;
  } else if (typedMessage.length > board.messageLimit) {
    alert('Message is too long, keep it under ' + board.messageLimit
        + ' characters.');
    return;
  } else if (typedEmail.length > 64) {
    alert('Email is too long, keep it under 64 characters.');
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

  board.originalButtonText = board.postButton.innerText;
  board.postButton.innerText = 'Uploading 0%';
  board.postButton.disabled = true;

  var spoilerCheckBox = document.getElementById('checkboxSpoiler');

  var noFlagCheckBox = document.getElementById('checkboxNoFlag');

  api.formApiRequest('newThread', {
    name : forcedAnon ? null : typedName,
    flag : hiddenFlags ? null : selectedFlag,
    captcha : captchaId,
    password : typedPassword,
    noFlag : noFlagCheckBox ? noFlagCheckBox.checked : false,
    spoiler : spoilerCheckBox ? spoilerCheckBox.checked : false,
    subject : typedSubject,
    message : typedMessage,
    email : typedEmail,
    files : files,
    boardUri : api.boardUri
  }, board.postCallback);

};

board.processFilesToPost = function(captchaId) {

  postCommon.newGetFilesToUpload(function gotFiles(files) {
    board.sendThreadData(files, captchaId);
  });

};

board.postThread = function() {

  if (api.hiddenCaptcha) {
    return bypassUtils.checkPass(board.processFilesToPost);
  }

  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();

  if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
    return alert('Captchas are exactly 6 (112 if no cookies) characters long.');
  }

  if (typedCaptcha.length == 112) {

    bypassUtils.checkPass(function() {
      board.processFilesToPost(typedCaptcha);
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
        board.processFilesToPost(parsedCookies.captchaid);
      });

    });
  }

};

board.makeMobilePageList = function(divPages) {
  var numPages = divPages.children.length;
  var currentPage = window.location.toString().split('/')[4];
  if (currentPage === '')
    currentPage = "1"
  else {
    currentPage = currentPage.slice(undefined, -5); // remove ".html"
    if (isNaN(parseInt(currentPage))) currentPage = "1";
  }

  var parentForm = document.createElement('form');
  var inputBox = document.createElement('input');
  inputBox.type = "text";
  inputBox.value = currentPage;
  parentForm.appendChild(inputBox);

  // remove all but the first and last pages
  for (var i = numPages - 2; i >= 1 ; i--) {
    divPages.children[i].remove()
  }

  divPages.insertBefore(parentForm, divPages.children[1]);
  parentForm.onsubmit = function(e) {
    e.preventDefault();

    var pageNum = parseInt(inputBox.value);
    if (isNaN(pageNum) || pageNum < 1 || pageNum >= numPages)
      return;

    if (pageNum === 1)
      window.location = "index.html"
    else
      window.location = pageNum + ".html";
  }
};

board.init();