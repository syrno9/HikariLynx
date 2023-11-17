var qr = {};

qr.init = function() {

  qr.setQr();


  //window.addEventListener('load', function() 
  setTimeout(function() {
	  var hash = window.location.hash.substring(1);
	  if (hash.indexOf('q') === 0 && hash.length > 1) {

		hash = hash.substring(1);

		var post = document.getElementById(hash);

		if (post) {

		  window.location.hash = hash;
		  post.scrollIntoView();
		  qr.showQr(hash);

		}

	  } 
  },100)

  var replyButton = document.getElementById("replyButton");
  replyButton.onclick = function(e) {
	e.preventDefault();
	qr.showQr();
  }

  var qrForm = document.getElementById('quick-reply').children[0];

  qrForm.onsubmit = function(e) {
	e.preventDefault();
	thread.postReply();
  }

};

qr.removeQr = function() {
  qr.qrPanel.style.display = 'none';
};

qr.showQr = function(quote) {

  qr.qrPanel.style.display = 'block';

  if (qr.qrPanel.getBoundingClientRect().top < 0) {
    qr.qrPanel.style.top = '25px';
  }

  if (quote === undefined)
    return;

  var quoteString = '>>' + quote + '\n';

  var selectedText = window.getSelection();
  if (selectedText != '') {
    quoteString += '>' + selectedText + '\n';
  }

  var targetField = document.getElementById('qrbody')

  targetField.focus();
  //insert at cursor position, courtesy of stackoverflow/11076975
  //IE support
  if (document.selection) {
      var sel = document.selection.createRange();
      sel.text = quoteString;
  }
  //MOZILLA and others
  else if (targetField.selectionStart || targetField.selectionStart === 0) {
      var startPos = targetField.selectionStart;
      var endPos = targetField.selectionEnd;

      if (startPos > 0 && targetField.value.substring(startPos-1, startPos) != '\n' )
        quoteString = '\n' + quoteString;

      targetField.value = targetField.value.substring(0, startPos)
          + quoteString
          + targetField.value.substring(endPos);
      targetField.selectionStart += quoteString.length;
      targetField.selectionEnd += quoteString.length;

  } else {
      targetField.value += quoteString;
  }

  var postingField = document.getElementById('fieldMessage')
  postingField.value = targetField.value;
  postingField.selectionStart = targetField.selectionStart + quoteString.length;

  postCommon.updateCurrentChar();

};

qr.registerSync = function(source, destination, field, event) {

  var sourceElement = document.getElementById(source);
  var destinationElement = document.getElementById(destination);

  if (!(sourceElement && destinationElement))
    return;

  destinationElement[field] = sourceElement[field];

  sourceElement.addEventListener(event, function() {
    if (destinationElement) {
      destinationElement[field] = sourceElement[field];
    }
  });

  destinationElement.addEventListener(event, function() {
    sourceElement[field] = destinationElement[field];
  });

};

qr.setQr = function() {
  qr.qrPanel = document.getElementById("quick-reply");
  qr.qrPanel.classList.add("floatingMenu");

  var flags = document.getElementById('flagsDiv') ? true : false;

/* fakey-fake templating
  //XXX
  var XXXremoveMe = new XMLHttpRequest();
  XXXremoveMe.open("GET", "/templates/content/quickReply.html", false);
  XXXremoveMe.send();
  //var newHtml = new DOMParser().parseFromString(XXXremoveMe.responseText, "text/html");
  //document.body.append(newHtml.body.children[0]);
  if (XXXremoveMe.status != 404) {
    qrdiv = document.getElementById("quick-reply");
    qrdiv.innerHTML = XXXremoveMe.responseText;
  }
//*/

  var qrClose = qr.qrPanel.getElementsByClassName('close-btn')[0];
  qrClose.onclick = function() { qr.removeQr() };

  var QRshowname = document.getElementById('fieldName') ? true : false;

  var textBoard = !document.getElementById('divUpload');

 /* 
 * XXX I guess flags is like a dropdown and noFlags disables location posting,
 * but these could be named better
 */
  var flags = document.getElementById('flagsDiv') ? true : false;

  var noFlagDiv = document.getElementById('noFlagDiv');

  interfaceUtils.setDraggable(qr.qrPanel, qr.qrPanel
      .getElementsByClassName('handle')[0]);

  qr.registerSync('fieldEmail', 'qremail', 'value', 'input');
  qr.registerSync('fieldSubject', 'qrsubject', 'value', 'input');
  qr.registerSync('fieldMessage', 'qrbody', 'value', 'input');
  document.getElementById('qrbody').addEventListener('input',
      postCommon.updateCurrentChar);
  qr.registerSync('fieldPostingPassword', 'qrpassword', 'value', 'input');
  qr.registerSync('alwaysUseBypassCheckBox', 'qralwaysUseBypassCheckBox',
      'checked', 'change');
  qr.registerSync('doSageCheckbox', 'qrdoSageCheckbox', 'checked', 'change');
  qr.registerSync('doFortuneCheckbox', 'qrdofortuneCheckbox', 'checked', 'change');

  if (noFlagDiv) {
	document.getElementById("qr-flags-check-row")
		.classList.remove("hidden");
    qr.registerSync('checkboxNoFlag', 'qrcheckboxNoFlag', 'checked', 'change');
  }

  if (!textBoard) {
    var filesBody = document.getElementById('qrFilesBody');

    filesBody.classList.remove('hidden');

    qr.registerSync('checkboxSpoiler', 'qrcheckboxSpoiler', 'checked',
            'change');
    qr.registerSync('checkboxScramble', 'qrcheckboxScramble', 'checked',
            'change');
    postCommon.setDragAndDrop(true);

    for (var i = 0; i < selectedDiv.childNodes.length; i++) {
      var originalCell = selectedDiv.childNodes[i];
      var clonedCell = originalCell.cloneNode(true);

      clonedCell.getElementsByClassName('removeButton')[0].onclick = originalCell
          .getElementsByClassName('removeButton')[0].onclick;

      selectedDivQr.appendChild(clonedCell);
    }
  }

  if (flags) {
	document.getElementById('qr-flags-row').classList.remove("hidden");

    var qrFlagCombo = document.getElementById('flagCombobox').cloneNode(true);
    qrFlagCombo.id = 'qrFlagCombobox';
    document.getElementById('qrFlagsDiv').appendChild(qrFlagCombo);

    qrFlagCombo = document.getElementById('qrFlagCombobox');

    postCommon.setFlagPreviews(qrFlagCombo);

    qr.registerSync('flagCombobox', 'qrFlagCombobox', 'value', 'change');

  }

  if (QRshowname) {
	document.getElementById('qr-name-row').classList.remove("hidden");

    qr.registerSync('fieldName', 'qrname', 'value', 'input');
  }

  if (!api.hiddenCaptcha) {

    var parts = document.getElementsByClassName('captchaImage')[0].src
        .split('/');

	document.getElementById('captchaBody').classList.remove("hidden");

	qr.qrPanel.getElementsByClassName('captchaImage')[0].src = '/' + parts[parts.length - 1];

    qr.registerSync('fieldCaptcha', 'QRfieldCaptcha', 'value', 'input');
  }

};

qr.setQRReplyText = function(text) {

  var qrReplyButton = document.getElementById('qrbutton');

  if (qrReplyButton) {
    qrReplyButton.value = text;
  }

};

qr.clearQRAfterPosting = function() {

  var qrMessageField = document.getElementById('qrbody');

  if (!qrMessageField) {
    return;
  }

  document.getElementById('qrsubject').value = '';
  qrMessageField.value = '';

};

qr.setQRReplyEnabled = function(enabled) {

  var qrReplyButton = document.getElementById('qrbutton');

  if (qrReplyButton) {
    qrReplyButton.disabled = !enabled;
  }

};

qr.init();
