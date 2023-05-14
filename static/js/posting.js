//posting.js: iterating over posts and adding new ones to the thread
posting = {};

posting.init = function() {

  api.noReportCaptcha = !document.getElementById('divReportCaptcha');
  posting.idsRelation = {};
  posting.highLightedIds = [];

  posting.postCellTemplate = api.getTemplate("thread-post-template");
  posting.uploadCell = api.getTemplate("thread-upload-template");

  var omissionIndicator = posting.postCellTemplate.template
    .getElementsByClassName("contentOmissionIndicator")[0];
  if (omissionIndicator)
    omissionIndicator.remove();

  posting.guiEditInfo = 'Edited last time by {$login} on {$date}.';

  posting.reverseHTMLReplaceTable = {};

  for ( var key in api.htmlReplaceTable) {
    posting.reverseHTMLReplaceTable[api.htmlReplaceTable[key]] = key;
  }

  posting.localTime = JSON.parse(localStorage.localTime || "false");
  posting.relativeTime = JSON.parse(localStorage.relativeTime || "false");

  /*TODO figure out what this was preventing
  if (typeof (thread) !== 'undefined') {
    return;
  }*/
  
  if (api.boardUri) {
    var yous = localStorage.getItem(api.boardUri + "-yous");

    posting.yous = yous === null ? [] : JSON.parse(yous);
    if (!(posting.yous instanceof Array))
      posting.yous = [posting.yous];
  }

  posting.existingPosts = Array.from(document.getElementsByClassName('linkSelf'))
    .map((linkSelf) => posting.parseExistingPost(linkSelf)).filter((post) => (post !== undefined));

  if (posting.relativeTime) {
    posting.updateAllRelativeTimes();
    setInterval(posting.updateAllRelativeTimes, 1000 * 60 * 5);
  }
};

//extract the name, tripcode, and ID (if enabled) from a post
posting.getExtraInfo = function(innerPost, postInfo) {
  var name = innerPost.getElementsByClassName('linkName')[0].innerText;

  if (name.indexOf('#') >= 0) {
    postInfo.trip = name.substring(name.lastIndexOf('#') + 1);
    postInfo.name = name.substring(0, name.indexOf('#'));
  } else {
    postInfo.name = name;
  }

  var labelId = innerPost.getElementsByClassName('labelId')[0];

  if (labelId) {
    postInfo.id = labelId.innerText;
  }
}

//parse (and modify) an existing post in the thread; adds tooltips, dropdowns,
//etc if scripts are loaded
posting.parseExistingPost = function(linkSelf, noExtras, noModify, noTooltips) {
  if (posting.postCellTemplate.template.contains(linkSelf)) {
    return;
  }
  var innerPost = linkSelf.parentNode.parentNode;
  var postInfo = api.parsePostLink(linkSelf.href);
  posting.getExtraInfo(innerPost, postInfo);

  var ret = {};
  ret.postInfo = postInfo;
  ret.linkSelf = linkSelf;
  ret.innerPost = innerPost;
  ret.files = innerPost.getElementsByClassName('panelUploads')[0];
  ret.message = innerPost.getElementsByClassName("divMessage")[0];

  if (noModify)
    return;

  //cache a clone of the node with alt before it gets additional backlinks
  if (typeof tooltips !== "undefined" && !noTooltips) {
    tooltips.addToKnownPostsForBackLinks(innerPost);
    tooltips.postCache[linkSelf.href] = innerPost.cloneNode(true);
  }

  //update with local times
  var labelCreated = innerPost.getElementsByClassName('labelCreated')[0];
  if (posting.localTime) {
    posting.setLocalTime(labelCreated);
  }

  if (posting.relativeTime) {
    posting.addRelativeTime(labelCreated);
  }

  //thumbnail hovering/hiding
  if (typeof thumbs !== "undefined") {
    Array.from(innerPost.getElementsByClassName('uploadCell'))
      .forEach((cell) => thumbs.processUploadCell(cell));
  }

  if (typeof embed !== "undefined") {
    Array.from(ret.message.getElementsByTagName("a"))
      .forEach((embedLink) => embed.processLinkForEmbed(embedLink));
  }

  if (typeof hiding !== "undefined") {
    hiding.hideIfHidden(ret, hiding.checkFilterHiding(linkSelf));
  }

  if (!noExtras)
    posting.addExternalExtras(ret, noTooltips);

  return ret;
};


posting.addExternalExtras = function(ret, noTooltips) {
  var innerPost = ret.innerPost;
  var linkSelf = ret.linkSelf;
  var postInfo = ret.postInfo;

  posting.processIdLabel(innerPost.getElementsByClassName("labelId")[0]);

  //(You)s
  if (posting.yous && posting.yous.indexOf(+postInfo.post) !== -1) {
    posting.markPostAsYou(postInfo.post, innerPost);
  }

  //load posting menu, hiding menu, and watcher
  //TODO: coalesce files?
  if (typeof postingMenu !== "undefined") {
    interfaceUtils.addMenuDropdown(ret, "Post Menu", 
      "extraMenuButton", postingMenu.buildMenu);
  }

  if (typeof hiding !== "undefined") {
    interfaceUtils.addMenuDropdown(ret, "Hide", 
      "hideButton", hiding.buildMenu);
  }

  if (typeof watcher !== "undefined") {
    if (postInfo.op)
      watcher.processOP(innerPost);
  }

  if (typeof qr !== "undefined") {
    var linkQuote = innerPost.getElementsByClassName('linkQuote')[0];

    linkQuote.onclick = function() {
      qr.showQr(linkQuote.href.match(/#q(\d+)/)[1]);
    };
  }

  if (typeof tooltips !== "undefined") {
    Array.from(innerPost.getElementsByClassName('quoteLink'))
      .forEach((quote) => {
        var target = api.parsePostLink(quote.href);
        tooltips.processQuote(quote, false, noTooltips);

        if (!posting.yous) return;

        if (api.boardUri === target.board && posting.yous.indexOf(+target.post) !== -1)
          quote.classList.add("you");

      });
  }
};

posting.setLocalTime = function(time) {

  time.innerText = api.formatDateToDisplay(
    new Date(time.innerText + ' UTC'), true);

};

posting.updateAllRelativeTimes = function() {

  var times = document.getElementsByClassName('labelCreated');

  for (var i = 0; i < times.length; i++) {
    posting.addRelativeTime(times[i]);
  }

};

posting.addRelativeTime = function(time) {

  var timeObject = new Date(time.innerText + (posting.localTime ? '' : ' UTC'));

  var relativeTime = time.nextSibling;
  if (relativeTime.className !== 'relativeTime') {

    relativeTime = document.createElement('span');

    relativeTime.className = 'relativeTime';

    time.parentNode.insertBefore(relativeTime, time.nextSibling);

  }

  var now = new Date();

  var content;

  var delta = now - timeObject;

  var second = 1000;
  var minute = second * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var month = day * 30.5;
  var year = day * 365.25;

  if (delta > 2 * year) {
    content = Math.ceil(delta / year) + ' years ago';
  } else if (delta > 2 * month) {
    content = Math.ceil(delta / month) + ' months ago';
  } else if (delta > 2 * day) {
    content = Math.ceil(delta / day) + ' days ago';
  } else if (delta > 2 * hour) {
    content = Math.ceil(delta / hour) + ' hours ago';
  } else if (delta > 2 * minute) {
    content = Math.ceil(delta / minute) + ' minutes ago';
  } else {
    content = 'Just now'
  }

  relativeTime.innerText = ' (' + content + ')';

};


posting.processIdLabel = function(label) {

  if (label === undefined)
    return;

  var id = label.innerText;
  var array = posting.idsRelation[id] || [];
  var cell = label.parentNode.parentNode.parentNode;

  if (cell.parentNode.className === 'inlineQuote'
      || cell.parentNode.className === 'quoteTooltip') {
  } else {
    posting.idsRelation[id] = array;

    array.push(cell);
  }

  label.onmouseover = function() {
    label.innerText = id + ' (' + array.length + ')';
  }

  label.onmouseout = function() {
    label.innerText = id;
  }

  label.onclick = function() {

    var index = posting.highLightedIds.indexOf(id);
	window.location.hash = '_';

    if (index > -1) {
      posting.highLightedIds.splice(index, 1);
    } else {
      posting.highLightedIds.push(id);
    }

    for (var i = 0; i < array.length; i++) {
      var cellToChange = array[i];

      if (cellToChange.className === 'innerOP') {
        continue;
      }

      if (index > -1) { /*? 'innerPost' : 'markedPost';*/
        cellToChange.classList.add("markedPost");
      }
    }

  };

};

posting.setLastEditedLabel = function(post, cell) {

  var editedLabel = cell.getElementsByClassName('labelLastEdit')[0];

  if (post.lastEditTime) {

    var formatedDate = api.formatDateToDisplay(new Date(post.lastEditTime));

    editedLabel.innerText = posting.guiEditInfo
        .replace('{$date}', formatedDate).replace('{$login}',
            post.lastEditLogin);

  } else {
    editedLabel.remove();
  }

};

posting.setUploadLinks = function(cell, file, noExtras) {

  var thumbLink = cell.getElementsByClassName('imgLink')[0];
  thumbLink.href = file.path;

  thumbLink.setAttribute('data-filemime', file.mime);
  // thumbLink.dataset.filemime = file.mime;

  if (file.mime.indexOf('image/') > -1 && !noExtras
      && (typeof gallery !== 'undefined') && !api.mobile) {
    gallery.addGalleryFile(file.path);
  }

  var img = document.createElement('img');
  img.src = file.thumb;

  thumbLink.appendChild(img);

  var nameLink = cell.getElementsByClassName('nameLink')[0];
  nameLink.href = file.path;

  var originalLink = cell.getElementsByClassName('originalNameLink')[0];
  // XXX why does the backend greedily format everything as an HTML string
  // originalLink.innerText = file.originalName;
  originalLink.innerHTML = file.originalName;
  originalLink.href = file.path;
  originalLink.setAttribute('download', file.originalName);

};

posting.setUploadCell = function(node, post, boardUri, noExtras) {

  if (!post.files) {
    return;
  }

  var files = post.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var cell = document.createElement('figure');
    cell.className = "uploadCell";
    posting.uploadCell.cloneInto(cell);

    posting.setUploadLinks(cell, file, noExtras);

    var sizeString = api.formatFileSize(file.size);
    cell.getElementsByClassName('sizeLabel')[0].innerText = sizeString;

    var dimensionLabel = cell.getElementsByClassName('dimensionLabel')[0];

	//unfortunately, this is a stopgap. the backend needs to do the same thing
    if (file.width) {
      dimensionLabel.innerText = file.width + '\xD7' + file.height;
      var gcd = (function(a,b){
		while (b != 0) {
			var t = b;
			b = a % b;
			a = t;
		}
		return a;
      })(file.width, file.height)
      dimensionLabel.title = (file.width/gcd) + ':' + (file.height/gcd);
    } else {
      dimensionLabel.remove();
    }

    var unlinkCell = cell.getElementsByClassName('unlinkLink')[0];
    var deleteCell = cell.getElementsByClassName('unlinkAndDeleteLink')[0];

    if (!api.mod) {
      unlinkCell.remove();
      deleteCell.remove();
    } else {
      var urlToUse = '/unlinkSingle.js?boardUri=' + boardUri;

      if (post.postId) {
        urlToUse += '&postId=' + post.postId;
      } else {
        urlToUse += '&threadId=' + post.threadId;
      }

      urlToUse += '&index=' + i;

      unlinkCell.href = urlToUse;
      deleteCell.href = urlToUse + '&delete=1';

    }

    if (file.sha256) {
      cell.getElementsByClassName('labelHash')[0].innerText = file.sha256;
    } else {
      cell.getElementsByClassName('divHash')[0].remove();
    }

    node.appendChild(cell);
  }

};

posting.setPostHideableElements = function(postCell, post, noExtras) {

  var subjectLabel = postCell.getElementsByClassName('labelSubject')[0];

  if (post.subject) {
    subjectLabel.innerText = post.subject;
  } else {
    subjectLabel.remove();
  }

  if (post.id) {
    var labelId = postCell.getElementsByClassName('labelId')[0];
    labelId.setAttribute('style', 'background-color: #' + post.id);
    labelId.innerText = post.id;
  } else {
    var spanId = postCell.getElementsByClassName('spanId')[0];
    spanId.remove();
  }

  var banMessageLabel = postCell.getElementsByClassName('divBanMessage')[0];

  if (!post.banMessage) {
    banMessageLabel.parentNode.removeChild(banMessageLabel);
  } else {
    //XXX review whether ban messages contain preformatted HTML
    banMessageLabel.innerHTML = post.banMessage;
  }

  posting.setLastEditedLabel(post, postCell);

  var imgFlag = postCell.getElementsByClassName('imgFlag')[0];

  if (post.flag) {
    imgFlag.src = post.flag;
    imgFlag.title = post.flagName.replace(/&(l|g)t;/g, function replace(match) {
      return posting.reverseHTMLReplaceTable[match];
    });

    if (post.flagCode) {
      imgFlag.className += ' flag' + post.flagCode;
    }
  } else {
    imgFlag.remove();
  }

  if (!post.asn) {
    postCell.getElementsByClassName('panelASN')[0].remove();
  } else {
    postCell.getElementsByClassName('labelASN')[0].innerText = post.asn;
  }

  if (!post.bypassId) {
    postCell.getElementsByClassName('panelBypassId')[0].remove();
  } else {
    postCell.getElementsByClassName('labelBypassId')[0].innerText = post.bypassId;
  }

  if (!post.ip) {
    postCell.getElementsByClassName('panelIp')[0].remove();
  } else {

    postCell.getElementsByClassName('labelIp')[0].innerText = post.ip;

    if (!post.broadRange) {
      postCell.getElementsByClassName('panelRange')[0].remove();
    } else {

      postCell.getElementsByClassName('labelBroadRange')[0].innerText = post.broadRange;
      postCell.getElementsByClassName('labelNarrowRange')[0].innerText = post.narrowRange;

    }

  }

};

posting.setPostLinks = function(postCell, post, boardUri, link, threadId,
    linkQuote, deletionCheckbox, preview) {

  var postingId = post.postId || threadId;

  preview = preview || api.isBoard;

  var linkStart = (preview ? '/' + boardUri + '/res/' + threadId + '.html' : '')
      + '#';

  linkQuote.href = linkStart;
  link.href = linkStart;

  link.href += postingId;
  linkQuote.href += 'q' + postingId;

  var linkEdit = postCell.getElementsByClassName('linkEdit')[0];
  var linkHistory = postCell.getElementsByClassName('linkHistory')[0];
  var linkFileHistory = postCell.getElementsByClassName('linkFileHistory')[0];
  var linkOffenseHistory = postCell.getElementsByClassName('linkOffenseRecord')[0];

  var complement = (post.postId ? 'postId' : 'threadId') + '=' + postingId;

  if (api.mod) {
    linkEdit.href = '/edit.js?boardUri=' + boardUri + '&';
    linkEdit.href += complement;
  } else if (linkEdit) {
    linkEdit.remove();
  }

  if (api.mod && (post.ip || post.bypassId)) {
    linkFileHistory.href = '/mediaManagement.js?boardUri=' + boardUri + '&';
    linkFileHistory.href += complement;

    linkHistory.href = '/latestPostings.js?boardUri=' + boardUri + '&';
    linkHistory.href += complement;

    linkOffenseHistory.href = '/offenseRecord.js?boardUri=' + boardUri + '&';
    linkOffenseHistory.href += complement;

  } else if (linkHistory) {
    linkHistory.remove();
    linkFileHistory.remove();
    linkOffenseHistory.remove();
  }

  var checkboxName = boardUri + '-' + threadId;

  if (post.postId) {
    checkboxName += '-' + post.postId;
  }

  deletionCheckbox.setAttribute('name', checkboxName);

};

posting.setRoleSignature = function(postingCell, posting) {

  var labelRole = postingCell.getElementsByClassName('labelRole')[0];

  if (posting.signedRole) {
    labelRole.innerText = posting.signedRole;
  } else {
    labelRole.parentNode.removeChild(labelRole);
  }

};

posting.setPostComplexElements = function(postCell, post, boardUri, threadId,
    noExtras, preview) {

  posting.setRoleSignature(postCell, post);

  var link = postCell.getElementsByClassName('linkSelf')[0];

  var linkQuote = postCell.getElementsByClassName('linkQuote')[0];
  linkQuote.innerText = post.postId || threadId;

  var deletionCheckbox = postCell.getElementsByClassName('deletionCheckBox')[0];

  posting.setPostLinks(postCell, post, boardUri, link, threadId, linkQuote,
      deletionCheckbox, preview);

  var panelUploads = postCell.getElementsByClassName('panelUploads')[0];

  if (!post.files || !post.files.length) {
    panelUploads.remove();
  } else {

    if (post.files.length > 1) {
      panelUploads.className += ' multipleUploads';
    }

    posting.setUploadCell(panelUploads, post, boardUri, noExtras);
  }

};

posting.addPost = function(post, boardUri, threadId, noExtras, preview, noParse) {

  var postCell = document.createElement('div');
  posting.postCellTemplate.cloneInto(postCell);

  postCell.id = post.postId;
  postCell.setAttribute('class', 'postCell');

  postCell.setAttribute('data-boarduri', boardUri);

  var labelBoard = postCell.getElementsByClassName('labelBoard')[0];

  if (preview) {
    labelBoard.innerText = '/' + boardUri + '/';
  } else {
    labelBoard.remove();
  }

  var linkName = postCell.getElementsByClassName('linkName')[0];

  linkName.innerText = post.name;

  if (post.email) {
    linkName.href = 'mailto:' + post.email;
  } else {
    linkName.className += ' noEmailName';
  }

  var labelCreated = postCell.getElementsByClassName('labelCreated')[0];

  labelCreated.innerText = api.formatDateToDisplay(new Date(post.creation));

  postCell.getElementsByClassName('divMessage')[0].innerHTML = post.markdown;

  posting.setPostHideableElements(postCell, post, noExtras);

  posting.setPostComplexElements(postCell, post, boardUri, threadId, noExtras,
      preview);

  if (!noParse) {
    var existParse = posting.parseExistingPost(
      postCell.getElementsByClassName('linkSelf')[0], noExtras);

    if (!noExtras) {
      posting.existingPosts.push(existParse);
    }
  }

  return postCell;

};

posting.markPostAsYou = function(id, obj) {
  var post = obj || document.getElementById(+id);
  if (!post) return;

  var author = post.querySelector(".linkName");
  if (!author) return;

  author.classList.add("youName");
};

//TODO this is only used by sideCatalog
posting.checkForYou = function(post, id) {
  if (posting.yous.indexOf(id) !== -1) {
    posting.markPostAsYou(id, post);
  }

  Array.from(post.getElementsByClassName("quoteLink"))
    .forEach(function(quote) {
      var id = quote.href.split("#")[1];
      if (posting.yous.indexOf(+id) !== -1) {
        posting.markReplyAsYou(quote);
      }
  });
};

posting.init();
