var catalog = {};

catalog.init = function() {

  catalog.catalogDiv = document.getElementById('divThreads');

  catalog.indicatorsRelation = {
    pinned : 'pinIndicator',
    locked : 'lockIndicator',
    cyclic : 'cyclicIndicator',
    autoSage : 'bumpLockIndicator'
  };

  catalog.refreshCheckBox = document.getElementById('autoCatalogRefreshCheckBox');
  catalog.refreshLabel = document.getElementById('catalogRefreshLabel');
  catalog.originalAutoRefreshText = catalog.refreshLabel.innerText;
  catalog.searchField = document.getElementById('catalogSearchField');

  catalog.catalogCellTemplate = api.getTemplate("catalog-cell-template");

  catalog.storedHidingData = JSON.parse(localStorage.hidingData || "{}");

  catalog.initCatalog();

};

catalog.startTimer = function(time) {

  if (time > 600) {
    time = 600;
  }

  catalog.currentRefresh = time;
  catalog.lastRefresh = time;
  catalog.refreshLabel.innerText = catalog.originalAutoRefreshText + ' '
      + catalog.currentRefresh;
  catalog.refreshTimer = setInterval(function checkTimer() {
    catalog.currentRefresh--;

    if (catalog.currentRefresh <= 0) {
      clearInterval(catalog.refreshTimer);
      catalog.refreshCatalog();
      catalog.refreshLabel.innerText = catalog.originalAutoRefreshText;
    } else {
      catalog.refreshLabel.innerText = catalog.originalAutoRefreshText + ' '
          + catalog.currentRefresh;
    }

  }, 1000);
};

catalog.changeCatalogRefresh = function() {

  catalog.autoRefresh = catalog.refreshCheckBox.checked;

  if (!catalog.autoRefresh) {
    catalog.refreshLabel.innerText = catalog.originalAutoRefreshText;
    clearInterval(catalog.refreshTimer);
  } else {
    catalog.startTimer(5);
  }

};

catalog.getHiddenMedia = function() {

  var hiddenMedia = localStorage.hiddenMedia;

  if (hiddenMedia) {
    hiddenMedia = JSON.parse(hiddenMedia);
  } else {
    hiddenMedia = [];
  }

  return hiddenMedia;

};

catalog.refreshCatalog = function(manual) {

  if (catalog.autoRefresh) {
    clearInterval(catalog.refreshTimer);
  }

  var currentData = JSON.stringify(catalog.catalogThreads);

  catalog.getCatalogData(function refreshed(error) {

    if (error) {
      return;
    }

    var changed = currentData != JSON.stringify(catalog.catalogThreads);

    if (catalog.autoRefresh) {
      catalog.startTimer(manual || changed ? 5 : catalog.lastRefresh * 2);
    }

    catalog.search();

  });

};

catalog.initCatalog = function() {

  catalog.changeCatalogRefresh();

  api.boardUri = window.location.toString().match(/\/(\w+)\/catalog.html/)[1];

  document.getElementById('divTools').style.display = 'inline-block';

  document.getElementById('catalogRefreshButton').onclick = function() {
    catalog.refreshCatalog(true)
  };

  catalog.searchField.addEventListener('input', function() {

    if (catalog.searchTimer) {
      clearTimeout(catalog.searchTimer);
    }

    catalog.searchTimer = setTimeout(function() {
      delete catalog.searchTime;
      catalog.search();
    }, 1000);

  });

  var refreshButton = document.getElementById('catalogRefreshButton');
  refreshButton.onclick = function() { catalog.refreshCatalog(true) };

  catalog.refreshCheckBox.onclick = function() { catalog.changeCatalogRefresh() };

  var postingForm = document.getElementById('newPostFieldset');

  if (postingForm) {

    var toggleLink = document.getElementById('togglePosting');
    toggleLink.style.display = 'inline-block';
    postingForm.style.display = 'none';

    toggleLink.onclick = function() {
      toggleLink.style.display = 'none';
      postingForm.style.display = 'inline-block';
    };
  }

  var links = document.getElementsByClassName('linkThumb');

  for (var i = links.length - 1; i >= 0; i--) {

    var link = links[i];

    if (catalog.catalogCellTemplate.template.contains(link)) {
      continue;
    }
  
    var child = link.childNodes[0];

    var matches = link.href.match(/(\w+)\/res\/(\d+)/);

    var board = matches[1];
    var thread = matches[2];

    var boardData = catalog.storedHidingData[board];

    if (boardData && boardData.threads.indexOf(thread) > -1) {
      var cell = link.parentNode;
      //TODO place these in a hidden thread container?
      cell.parentNode.removeChild(cell);
    } else if (child.tagName === 'IMG') {
      catalog.checkForFileHiding(child);
    }

  }

  catalog.getCatalogData();

};

catalog.checkForFileHiding = function(child) {

  var srcParts = child.src.split('/');

  var hiddenMedia = catalog.getHiddenMedia();

  var finalPart = srcParts[srcParts.length - 1].substr(2);

  for (var j = 0; j < hiddenMedia.length; j++) {

    if (hiddenMedia[j].indexOf(finalPart) > -1) {
      child.parentNode.innerText = 'Open';
      break;
    }

  }
};

catalog.setCellThumb = function(thumbLink, thread) {
  thumbLink.href = '/' + api.boardUri + '/res/' + thread.threadId + '.html';

  if (thread.thumb) {
    var thumbImage = document.createElement('img');

    thumbImage.src = thread.thumb;
    thumbLink.appendChild(thumbImage);
    catalog.checkForFileHiding(thumbImage);
  } else {
    thumbLink.innerText = 'Open';
  }
};

catalog.setCatalogCellIndicators = function(thread, cell) {

  for ( var key in catalog.indicatorsRelation) {
    if (!thread[key]) {
      cell.getElementsByClassName(catalog.indicatorsRelation[key])[0].remove();
    }
  }

};

catalog.setCell = function(thread) {

  var cell = document.createElement('div');

  cell.className = 'catalogCell';
  catalog.catalogCellTemplate.cloneInto(cell);

  catalog.setCellThumb(cell.getElementsByClassName('linkThumb')[0], thread);

  var labelReplies = cell.getElementsByClassName('labelReplies')[0];
  labelReplies.innerText = thread.postCount || 0;

  var labelImages = cell.getElementsByClassName('labelImages')[0];
  labelImages.innerText = thread.fileCount || 0;
  cell.getElementsByClassName('labelPage')[0].innerText = thread.page;

  if (thread.subject) {
    cell.getElementsByClassName('labelSubject')[0].innerHTML = thread.subject;
  }

  catalog.setCatalogCellIndicators(thread, cell);

  cell.getElementsByClassName('divMessage')[0].innerHTML = thread.markdown;

  cell.onclick = function (e) {
    var cell = e.target;
    while(cell.parentNode.id != "divThreads") {cell=cell.parentNode;}
    cell.classList.toggle('scrollCell');
  }

  return cell;

};

catalog.search = function() {

  if (!catalog.catalogThreads) {
    return;
  }

  var term = catalog.searchField.value.toLowerCase();

  while (catalog.catalogDiv.firstChild) {
    catalog.catalogDiv.removeChild(catalog.catalogDiv.firstChild);
  }

  var boardData = catalog.storedHidingData[api.boardUri];

  for (var i = 0; i < catalog.catalogThreads.length; i++) {

    var thread = catalog.catalogThreads[i];

    if ((boardData && boardData.threads.indexOf(thread.threadId.toString()) > -1)
        || (term.length && thread.message.toLowerCase().indexOf(term) < 0 && (thread.subject || '')
            .toLowerCase().indexOf(term) < 0)) {
      continue;
    }

    catalog.catalogDiv.appendChild(catalog.setCell(thread));

  }

};

catalog.getCatalogData = function(callback) {

  if (catalog.loadingData) {
    return;
  }

  catalog.loadingData = true;

  api.localRequest('/' + api.boardUri + '/catalog.json', function gotBoardData(
      error, data) {

    catalog.loadingData = false;

    if (error) {
      if (callback) {
        callback(error);
      } else {
        console.log(error);
      }
      return;
    }

    catalog.catalogThreads = JSON.parse(data);
    if (callback) {
      callback();
    }

    document.body.classList.add("jsenabled");
  });

};

catalog.init();
