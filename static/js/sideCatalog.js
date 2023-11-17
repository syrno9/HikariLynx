var sideCatalog = {};

sideCatalog.init = function() {

  document.getElementById('sideCatalogRefreshButton').onclick = function() { 
    sideCatalog.refreshSideCatalog()
  };

  sideCatalog.sideCatalogBody = document.getElementById('sideCatalogBody');
  sideCatalog.mainBody = document.getElementById('mainPanel');

  sideCatalog.sideCatalogDiv = document.getElementById('sideCatalogDiv');
  sideCatalog.sideCatalogCheckbox = document.getElementById('showSideCatalog');

  if (localStorage.hideSideCatalog === undefined) {
	localStorage.hideSideCatalog = true;
  }

  if (!localStorage.hideSideCatalog) {
    sideCatalog.sideCatalogCheckbox.checked = true;
    sideCatalog.refreshSideCatalog();
  }

  document.getElementById('closeSideCatalogButton').onclick = function(e) {
    sideCatalog.sideCatalogCheckbox.checked = false;
    localStorage.setItem('hideSideCatalog', true);
    return false;
  }

  var catalogButton = document.getElementById('navCatalog');

  var sideCatalogRefreshButton = document.getElementById("sideCatalogRefreshButton")
  sideCatalogRefreshButton.onclick = function() { sideCatalog.refreshSideCatalog() };

  var sideCatalogButton = document.createElement('a');
  sideCatalogButton.className = 'coloredIcon';
  sideCatalogButton.id = 'navSideCatalog';
  sideCatalogButton.title = 'Side Catalog';
  sideCatalogButton.onclick = function() {
    sideCatalog.refreshSideCatalog();
    sideCatalog.sideCatalogCheckbox.checked = true;
    localStorage.setItem('hideSideCatalog', false);
  };

  catalogButton.parentNode.insertBefore(sideCatalogButton,
      catalogButton.nextSibling);

  catalogButton.parentNode.insertBefore(document.createTextNode(' '),
      catalogButton.nextSibling);

  catalogButton.parentNode.insertBefore(document.createTextNode(' '),
      catalogButton.nextSibling);

};

sideCatalog.removeAllFromClass = function(className) {

  var elements = document.getElementsByClassName(className);

  while (elements.length) {
    elements[0].remove();
  }

};

sideCatalog.handleReceivedData = function(data, cell, threadData) {

  sideCatalog.loadingThread = false;

  thread.transition();

  sideCatalog.transitionThread(cell, threadData, data);

  tooltips.cacheData(data);

};

sideCatalog.loadThread = function(cell, threadData) {

  sideCatalog.loadingThread = true;

  if (typeof thread !== "undefined")
    thread.stopWs();

  if (api.mod) {

    api.formApiRequest('mod', {}, function(status, data) {

      if (status !== 'ok') {
        return;
      }

      sideCatalog.handleReceivedData(data, cell, threadData);

    }, false, {
      boardUri : api.boardUri,
      threadId : threadData.threadId
    });

  } else {

    api.localRequest('/' + api.boardUri + '/res/' + threadData.threadId
        + '.json', function(error, data) {

      if (error) {
        alert(error);
      }

      sideCatalog.handleReceivedData(JSON.parse(data), cell, threadData);

    });
  }

};

sideCatalog.transitionThread = function(cell, threadData, data) {

  if (sideCatalog.selectedThreadCell) {
    sideCatalog.selectedThreadCell.className = 'sideCatalogCell';
  }

  cell.classList.add('sideCatalogMarkedCell');
  sideCatalog.selectedThreadCell = cell;

  window.history.pushState('', '',
      document.getElementById('divMod') ? '/mod.js?boardUri=' + api.boardUri
          + '&threadId=' + threadData.threadId : '/' + api.boardUri + '/res/'
          + threadData.threadId + '.html');

  document.getElementById('threadIdentifier').value = threadData.threadId;

  if (document.getElementById('divMod')) {

    document.getElementById('controlThreadIdentifier').value = threadData.threadId;

    if (postingMenu.globalRole <= 3) {
      document.getElementById('transferThreadIdentifier').value = threadData.threadId;
    }

    document.getElementById('checkboxLock').checked = threadData.locked;
    document.getElementById('checkboxPin').checked = threadData.pinned;
    document.getElementById('checkboxCyclic').checked = threadData.cyclic;

  }

  document.title = '/' + api.boardUri + '/ - '
      + (threadData.subject || threadData.message);

  //XXX shouldn't this be done in thread.transition()?
  thread.wssSocket = threadData.wssSocket;
  thread.wsSocket = threadData.wsSocket;

  posting.existingPosts = [];
  tooltips.knownPosts = {};
  gallery.galleryFiles = [];
  gallery.currentIndex = 0;

  var opCell = document.getElementsByClassName('opCell')[0];

  opCell.scrollIntoView();

  document.getElementsByClassName('divPosts')[0].innerText = '';

  opCell.id = threadData.threadId;
  opCell.className = 'opCell';

  var opPost = posting.addPost(data, data.boardUri, data.threadId);
  sideCatalog.synchronizeContents(opCell, opPost);

  api.resetIndicators(data);

  opCell.setAttribute('data-boarduri', data.boardUri);

  thread.fullRefresh = true;
  thread.initThread();

  if (data.posts && data.posts.length) {

    thread.lastReplyId = data.posts[data.posts.length - 1].postId;

    data.posts.forEach((post) => {
      thread.divPosts.appendChild(
        posting.addPost(post, api.boardUri, api.threadId));
    })
  }

  hiding.checkFilters();

};

sideCatalog.synchronizeContents = function(opCell, post) {

  //checkboxes
  var opCheckbox = opCell.getElementsByClassName('deletionCheckBox')[0];
  var postCheckbox = post.getElementsByClassName('deletionCheckBox')[0];

  opCheckbox.name = postCheckbox.name;
  opCheckbox.value = postCheckbox.value;

  //Add in differences from post and op templates

  var opInfo = sideCatalog.tryDuplicate(opCell, post, "opHead", "postInfo");
  opInfo.className = "opHead title";

  //uploads panel
  sideCatalog.tryDuplicate(opCell, post, "panelUploads", "panelUploads", 
    undefined, opInfo)
  .className = "panelUploads opUploadPanel";

  //message & IP
  var opMessage = sideCatalog.tryDuplicate(opCell, post, "divMessage",
    "divMessage");

  sideCatalog.tryDuplicate(opCell, post, "panelASN", "panelASN", 
    opMessage.parentNode, opMessage.nextSibling);

  sideCatalog.tryDuplicate(opCell, post, "panelBypassId", "panelBypassId", 
    opMessage.parentNode, opMessage.nextSibling);

  sideCatalog.tryDuplicate(opCell, post, "panelIp", "panelIp", 
    opMessage.parentNode, opMessage.nextSibling);

  sideCatalog.tryDuplicate(opCell, post, "divBanMessage", "divBanMessage", 
    opMessage.parentNode, null);

  sideCatalog.tryDuplicate(opCell, post, "labelLastEdit", "labelLastEdit", 
    opMessage.parentNode, null);
};

sideCatalog.tryDuplicate = function(opCell, postCell, opClass, postClass, 
    parentNode, beforeNext) {

  var opElement = opCell.getElementsByClassName(opClass)[0];
  var postElement = postCell.getElementsByClassName(postClass)[0];

  if (!parentNode && opElement) {
    parentNode = opElement.parentNode;
  }

  if (!beforeNext && opElement) {
    beforeNext = opElement.nextSibling;
  }

  if (postElement) {
    parentNode.insertBefore(postElement, beforeNext);
  } 

  if (opElement) {
    opElement.remove();
  }

  return postElement;
}

sideCatalog.addSideCatalogThread = function(thread) {

  var cell = document.createElement('a');

  cell.onclick = function() {

    if (sideCatalog.loadingThread || thread.threadId === api.threadId
        || sideCatalog.waitingForRefreshData) {
      return;
    } else if (thread.refreshingThread) {
      sideCatalog.waitingForRefreshData = {
        cell : cell,
        thread : thread
      };

      return;
    }

    sideCatalog.loadThread(cell, thread);

  };

  if (thread.thumb) {

    var img = document.createElement('img');

    img.src = thread.thumb;

    cell.appendChild(img);
  }

  var linkContent = document.createElement('span');
  linkContent.className = 'sideCatalogCellText';
  cell.appendChild(linkContent);

  var upperText = document.createElement('span');
  var lowerText = document.createElement('span');

  linkContent.appendChild(upperText);
  linkContent.appendChild(lowerText);

  upperText.innerHTML = (thread.subject || (thread.message.replace(/[<>'"]/g,
      function(match) {
        return api.htmlReplaceTable[match];
      }).substring(0, 128) || thread.threadId));

  lowerText.innerText = 'R: ' + (thread.postCount || 0) + ' / F: '
      + (thread.fileCount || 0);

  sideCatalog.sideCatalogBody.appendChild(cell);

  cell.className = 'sideCatalogCell';
  if (api.threadId === thread.threadId) {
    cell.classList.add('sideCatalogMarkedCell');
    cell.scrollIntoView();
    sideCatalog.selectedThreadCell = cell;
  }
};

sideCatalog.processCatalogData = function(data) {

  sideCatalog.sideCatalogBody.innerText = '';

  var boardData = hiding.storedHidingData[api.boardUri];

  for (var i = 0; i < data.length; i++) {

    var thread = data[i];

    if ((boardData && boardData.threads.indexOf(thread.threadId.toString()) > -1)) {
      continue;
    }

    sideCatalog.addSideCatalogThread(thread);
  }

};

sideCatalog.refreshSideCatalog = function() {

  if (sideCatalog.refreshingSideCatalog) {
    return;
  }

  sideCatalog.refreshingSideCatalog = true;

  api.localRequest('/' + api.boardUri + '/catalog.json', function(error, data) {

    sideCatalog.refreshingSideCatalog = false;

    if (error) {
      return;
    }

    sideCatalog.processCatalogData(JSON.parse(data));

  });

};

sideCatalog.init();
