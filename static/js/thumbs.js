var thumbs = {};

thumbs.init = function() {

  thumbs.playableTypes = [ 'video/webm', 'audio/mpeg', 'video/mp4',
      'video/ogg', 'audio/ogg', 'audio/webm' ];

  thumbs.videoTypes = [ 'video/webm', 'video/mp4', 'video/ogg' ];

  thumbs.FLASH_MIME = "application/x-shockwave-flash";

  thumbs.hiddenMedia = JSON.parse(localStorage.hiddenMedia || "[]");

  thumbs.playingVideos = []

  thumbs.hoveringImage = undefined;
  if (JSON.parse(localStorage.hoveringImage || 'false'))
	thumbs.addHoveringExpand();
};

thumbs.scrollToPost = function(thumb) {
  while (!thumb.classList.contains("innerPost") &&
    !thumb.classList.contains("innerOP")) {
    thumb = thumb.parentNode;
  }
  thumb.scrollIntoView();
}

thumbs.addHoveringExpand = function() {
  if (thumbs.hoveringImage !== undefined)
	thumbs.hoveringImage.remove();

  var hover = document.createElement("img");
  hover.style.position = "fixed";

  thumbs.hoveringImage = hover;
}

thumbs.removeHoveringExpand = function() {
  if (thumbs.hoveringImage !== undefined) {
    thumbs.hoveringImage.remove();
    thumbs.hoveringImage = undefined;
  }
}

thumbs.expandImage = function(mouseEvent, link, mime) {

  if (mouseEvent.which === 2 || mouseEvent.ctrlKey) {
    return true;
  }

  var thumb = link.getElementsByTagName('img')[0];

  if (thumb.style.display === 'none') {
    link.parentNode.parentNode.classList.remove('expandedCell');
    link.getElementsByClassName('imgExpanded')[0].style.display = 'none';
    thumb.style.display = '';

    if (thumb.getBoundingClientRect().top < 0) {
      thumbs.scrollToPost(thumb);
    }

    return false;
  }
  link.parentNode.parentNode.classList.add('expandedCell');

  var expanded = link.getElementsByClassName('imgExpanded')[0];

  if (expanded) {
    thumb.style.display = 'none';
    expanded.style.display = '';
    thumbs.scrollToPost(link);
  } else {
    var expandedSrc = link.href;

    if (thumb.src === expandedSrc && mime !== 'image/svg+xml') {
      return false;
    }

    expanded = document.createElement('img');
    expanded.setAttribute('src', expandedSrc);
    expanded.className = 'imgExpanded';
    expanded.style.width = link.dataset.filewidth + "px";

    thumb.style.display = 'none';
    link.appendChild(expanded);
    var maxwidth = Math.min(link.parentNode.getBoundingClientRect(), maxwidth);
    expanded.style.width = maxwidth.width + "px";
    var rect = expanded.getBoundingClientRect();
    expanded.style.height = ((link.dataset.fileheight / link.dataset.filewidth) * maxwidth) + "px";
  }

  //remove image on expand
  if (thumbs.hoveringImage !== undefined) {
    thumbs.hoveringImage.src = "";
    thumbs.hoveringImage.remove();
  }

  return false;

};

thumbs.createHideLink = function(player, callback) { 
  var hideLink = document.createElement('a');
  hideLink.innerText = '[ - ]';
  hideLink.style.cursor = 'pointer';
  hideLink.className = 'hideLink';

  hideLink.onclick = function() {
    player.parentNode.classList.remove('expandedCell');
    callback();

    var findVideo = thumbs.playingVideos.indexOf(player);
    if (findVideo >= 0) {
      thumbs.playingVideos.splice(findVideo, 1)
      if (!thumbs.playingVideos.length && typeof thread !== "undefined") {
        //restart refresh countdown
        thread.startTimer(thread.currentRefresh || 5)
      }
    }
  }

  return hideLink;
}

thumbs.setPlayer = function(link, mime) {

  var path = link.href;
  var parent = link.parentNode;

  var src = document.createElement('source');
  src.setAttribute('src', link.href);
  src.setAttribute('type', mime);

  var isVideo = thumbs.videoTypes.indexOf(mime) > -1;

  var video = document.createElement(isVideo ? 'video' : 'audio');
  if (isVideo) {
    video.loop = !JSON.parse(localStorage.noAutoLoop || 'false');
  }

  video.setAttribute('controls', true);
  video.style.display = 'none';
  video.volume = JSON.parse(localStorage.videovol || 1);

  link.onclick = function(mouseEvent) {
    mouseEvent.preventDefault();

    if (mouseEvent.which === 2 || mouseEvent.ctrlKey) {
      return true;
    }

    parent.parentNode.classList.add('expandedCell');

    var hideLink = thumbs.createHideLink(video, function() {
      parent.parentNode.classList.remove('expandedCell');
      link.style.display = 'inline';
      video.style.display = 'none';
      hideLink.style.display = 'none';

      video.pause();
    });
    parent.insertBefore(hideLink, video);

    if (!video.childNodes.count) {
      video.appendChild(src);
    }
	
    if (typeof thread !== "undefined" && thread.currentRefresh) {
      clearInterval(thread.refreshTimer);
    }

    thumbs.playingVideos.push(video)

    link.style.display = 'none';
    video.style.display = 'inline';
    hideLink.style.display = 'inline';
    video.play();

    return false;
  };

  parent.appendChild(video);
};

thumbs.setRuffle = function(link) {
  link.onclick = function() {
    var container = link.parentNode;
    container.classList.add('expandedCell');

    var ruffle = window.RufflePlayer.newest();
    var player = ruffle.createPlayer();
    player.config = {
      autoplay: "on",
      unmuteOverlay: "visible",
      backgroundColor: null,
      letterbox: "on",
      warnOnUnsupportedContent: true,
      contextMenu: true,
      showSfwDownload: false,
      upgradeToHttps: true,
      logLevel: "warn",
      quality: "best"
    }

    var hideLink = thumbs.createHideLink(player, function() {
      hideLink.remove();
      player.remove();
      link.style.display = null;
    });
	
    if (typeof thread !== "undefined" && thread.currentRefresh) {
      clearInterval(thread.refreshTimer);
    }

    thumbs.playingVideos.push(player)

    link.style.display = 'none';
    hideLink.style.display = 'inline-block';
    player.style.display = 'inline-block';

    container.append(hideLink);
    container.append(player);
    player.load(link.href);

    return false;
  }
}

thumbs.hoverExpand = function(e, link) {
	if (thumbs.hoveringImage === undefined)
		return;

	var thumb = link.getElementsByTagName("img")[0];

	//no hover if hiding thumbnail
	if (thumb === undefined || thumb.style.display === "none")
		return;

	var hover = thumbs.hoveringImage;
	hover.src = link.href;

	var boundBox = link.getBoundingClientRect();
	var right = window.innerWidth - boundBox.left;
	if (right > boundBox.left) {
		hover.style.left = boundBox.right + "px";
		hover.style.right = "";
	} else {
		hover.style.left = "";
		hover.style.right = right + "px";
	//	hover.style.maxWidth = boundBox.left + "px";
	}

	hover.style.maxHeight = "100%";
	hover.style.top = "0px"; //(16 + boundBox.top) + "px";

	document.body.appendChild(thumbs.hoveringImage);
}

thumbs.processImageLink = function(link) {

  var mime = link.dataset.filemime;

  if (mime.indexOf('image/') > -1) {

    link.onclick = function(mouseEvent) {
      return thumbs.expandImage(mouseEvent, link, mime);
    };

	link.onmouseenter = function(e) {
      return thumbs.hoverExpand(e, link);
	};

	link.onmouseleave = function(e) {
	  if (thumbs.hoveringImage !== undefined) {
      //TODO replace source with loading icon?
      thumbs.hoveringImage.src = "";
      thumbs.hoveringImage.remove();
	  }
	};

  } else if (thumbs.playableTypes.indexOf(mime) > -1) {
    thumbs.setPlayer(link, mime);
  } else if (mime === thumbs.FLASH_MIME) {
    thumbs.setRuffle(link);
  }
};

thumbs.processFileForHiding = function(file) {

  var details = file.getElementsByTagName('details')[0];
  if (!details)
    return;

  var nameLink = file.getElementsByClassName('nameLink')[0];

  var fileName = nameLink.href.split('/');
  fileName = fileName[fileName.length - 1];

  var hiddenIndex = thumbs.hiddenMedia.indexOf(fileName);

  if (hiddenIndex !== -1)
    details.removeAttribute("open")

  details.ontoggle = function() {

    var hiddenIndex = thumbs.hiddenMedia.indexOf(fileName);

    if (details.open && hiddenIndex >= 0) {
      thumbs.hiddenMedia.splice(hiddenIndex, 1);
    } else if (!details.open && hiddenIndex == -1) {
      thumbs.hiddenMedia.push(fileName);
    }

    localStorage.hiddenMedia = JSON.stringify(thumbs.hiddenMedia);

  };

};

thumbs.processUploadCell = function(uploadCell) {
  thumbs.processFileForHiding(uploadCell);

  var imgLink = uploadCell.getElementsByClassName('imgLink')[0];
  if (!imgLink)
    return;

  thumbs.processImageLink(imgLink);
};

thumbs.init();
