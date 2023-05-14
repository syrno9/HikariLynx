var tooltips = {};

tooltips.init = function() {

  tooltips.currentTooltip = null;
  tooltips.unmarkReply = false;

  tooltips.bottomMargin = 25;
  tooltips.loadingPreviews = {};
  tooltips.postCache = {};
  tooltips.knownPosts = {};
  tooltips.externalThreadCache = {};

  tooltips.bottomBacklinks = JSON.parse(localStorage.bottomBacklinks || "false");
  tooltips.inlineReplies = JSON.parse(localStorage.inlineReplies || "false");
  // tooltips.quoteReference = {}; Deprecated?
  document.body.addEventListener("touchend", tooltips.removeIfExists);
  window.addEventListener("hashchange", tooltips.removeIfExists);
};

tooltips.removeIfExists = function(e) {
  if (!tooltips.currentTooltip) {
    return false;
  }

  if (tooltips.unmarkReply) {
	//unmark and remove reply underlines
	tooltips.currentTooltip.classList.remove('markedPost');
	Array.from(tooltips.currentTooltip.getElementsByClassName('replyUnderline'))
	  .forEach((a) => a.classList.remove('replyUnderline'))
	tooltips.unmarkReply = false;
  } else {
    tooltips.currentTooltip.remove();
  }

  tooltips.currentTooltip = null;
};

tooltips.addReplyUnderline = function(tooltip, board, quoteId) {
  if (board !== api.boardUri)
    return;

  //find all backlinks
  Array.from(tooltip.getElementsByClassName("panelBacklinks"))
  .reduce((acc, panel) => acc.concat(Array.from(panel.children)), [])
  //and quotes
  .concat(Array.from(tooltip.getElementsByClassName('quoteLink')))
  .forEach((a) => {
    if (a.innerText.indexOf(quoteId) === -1)
      return;
    a.classList.add('replyUnderline');
  })
}

tooltips.quoteAlreadyAdded = function(quoteUrl, innerPost) {
  var previews = innerPost.getElementsByClassName("replyPreview")[0];
  var message = innerPost.getElementsByClassName("divMessage")[0];

  return Array.from(message.children).concat(Array.from(previews.children))
  .reduce((acc, preview) => {
    var linkSelf = preview.getElementsByClassName("linkSelf")[0];
    return acc || (linkSelf && linkSelf.href === quoteUrl)
  }, false)
}

tooltips.checkHeight = function(tooltip) {
  var rect = tooltip.getBoundingClientRect();
  var offscreen = rect.bottom - window.innerHeight
  if (offscreen > 0) {
    tooltip.style.top = (rect.top + window.scrollY - offscreen - 5) + 'px';
    tooltip.style.bottom = '5px';
  }
}

tooltips.addToKnownPostsForBackLinks = function(posting) {

  var postBoard = posting.parentNode.dataset.boarduri;
  var postId = posting.parentNode.id;

  var list = tooltips.knownPosts[postBoard] || {};
  tooltips.knownPosts[postBoard] = list;

  var backlinks = posting.getElementsByClassName("panelBacklinks")[0];

  var backlinkDupe = backlinks.cloneNode(true);
  var altBacklinks = document.createElement("DIV");
  altBacklinks.className = "altBacklinks";
  altBacklinks.append(backlinkDupe);
  posting.append(altBacklinks);

  if (tooltips.bottomBacklinks) {
    backlinks.style.display = "none";
    backlinkDupe.style.display = "block";
  }

  var replyPreview = document.createElement("DIV");
  replyPreview.className = "replyPreview";
  posting.append(replyPreview);

  list[postId] = {
    added : [],
    container : backlinks,
    altContainer : backlinkDupe,
  };

};

tooltips.processQuote = function(quote, isBacklink, noAddBacklink) {

  var quoteTarget = api.parsePostLink(quote.href);
  var innerPost = quote;

  while (!(innerPost.classList.contains('innerPost') ||
  innerPost.classList.contains('innerOP'))) {
	innerPost = innerPost.parentNode;
  }

  var sourceId = api.parsePostLink(innerPost.getElementsByClassName('linkSelf')[0].href).post;

  if (!isBacklink) {
	if (!noAddBacklink) {
      tooltips.addBackLink(quote, quoteTarget, innerPost.parentNode);
	  if (api.boardUri == quoteTarget.board) {
	    if (api.threadId == quoteTarget.post)
	      quote.innerText += ' (OP)';
	    else if (api.threadId && api.threadId != quoteTarget.thread && !quoteTarget.op)
	      quote.append(" (" + quoteTarget.thread + ')');
      }
    }
  }

  tooltips.addHoverEvents(quote, innerPost, quoteTarget, sourceId);

  tooltips.addInlineClick(quote, innerPost, isBacklink, quoteTarget, sourceId);
};

tooltips.addBackLink = function(quote, quoteTarget, containerPost) {

  var knownBoard = tooltips.knownPosts[quoteTarget.board];

  if (!knownBoard)
    return;

  var knownBackLink = knownBoard[quoteTarget.post];

  if (!knownBackLink)
    return;

  var sourceBoard = containerPost.dataset.boarduri;
  var sourcePost = containerPost.id;

  var sourceId = sourceBoard + '_' + sourcePost;

  if (knownBackLink.added.indexOf(sourceId) > -1) {
    return;
  } else {
    knownBackLink.added.push(sourceId);
  }

  var text = '>>';

  if (sourceBoard != quoteTarget.board) {
    text += '/' + containerPost.dataset.boarduri + '/';
  }

  text += sourcePost;

  var backLink = document.createElement('a');
  backLink.innerText = text;

  backLink.href = '/' + sourceBoard + '/res/' + quoteTarget.thread + '.html#'
      + sourcePost;

  knownBackLink.container.appendChild(backLink);
  knownBackLink.container.appendChild(document.createTextNode(' '));

  tooltips.processQuote(backLink, true);

  var dupe = backLink.cloneNode(true);
  knownBackLink.altContainer.appendChild(dupe);
  knownBackLink.altContainer.appendChild(document.createTextNode(' '));

  tooltips.processQuote(dupe, true);

};

tooltips.addHoverEvents = function(quote, innerPost, quoteTarget, sourceId) {

  var createTooltip = function(e) {
    tooltips.removeIfExists();
    if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent) {
      if (!tooltips.currentTooltip)
        e.preventDefault();
      e.stopPropagation();
    }
    
    //loading or inline quote already added
    if (tooltips.loadingPreviews[quoteTarget.quoteUrl] ||
    tooltips.quoteAlreadyAdded(quoteTarget.quoteUrl, innerPost))
      return;

    var tryHighlight = document.getElementById(quoteTarget.post);
    //try to just mark the post, if it appears on the page
    if (api.boardUri === quoteTarget.board && tryHighlight) {
      tryHighlight = tryHighlight.getElementsByClassName("innerPost")[0];
      var highlightRect = tryHighlight.getBoundingClientRect();
      
      const tol = 16; //maximum number of pixels that can be hidden
      var fromBottom = highlightRect.y + highlightRect.height - window.innerHeight;
      
      if (highlightRect.height && highlightRect.y > -tol && fromBottom < tol) {
        if (!tryHighlight.classList.contains('markedPost')) {
          tooltips.currentTooltip = tryHighlight;
          tooltips.unmarkReply = true;
          tryHighlight.classList.add('markedPost');
          tooltips.addReplyUnderline(tryHighlight, quoteTarget.board, sourceId);
        }
        return;
      }
    }
    
    var tooltip = document.createElement('div');
    tooltip.className = 'quoteTooltip';
    document.body.appendChild(tooltip);

    var rect = quote.getBoundingClientRect();
    if (!api.mobile) {
      if (rect.left > window.innerWidth/2) {
        var right = window.innerWidth - rect.left - window.scrollX;
        tooltip.style.right = right + 'px';
      } else {
        var left = rect.right + 10 + window.scrollX;
        tooltip.style.left = left + 'px';
      }
    }

    tooltip.style.top = (rect.top + window.scrollY) + 'px';
    tooltip.style.display = 'inline';

    //add the cached node or begin query
    tooltips.loadTooltip(tooltip, quoteTarget.quoteUrl, sourceId);

	tooltips.currentTooltip = tooltip;
  };

  if (!api.mobile) {
    quote.addEventListener("mouseenter", createTooltip);
  }
  // quote.addEventListener("touchend", createTooltip);

  quote.addEventListener("mouseout", tooltips.removeIfExists);
}

tooltips.addInlineClick = function(quote, innerPost, isBacklink, quoteTarget, sourceId) {

  quote.addEventListener("click", function(e) {
    if (!tooltips.inlineReplies)
      return;
    
    e.preventDefault();
    var replyPreview = Array.from(innerPost.children)
      .find((a) => a.className === "replyPreview");
    var divMessage = innerPost.getElementsByClassName("divMessage")[0];

    if (tooltips.loadingPreviews[quoteTarget.quoteUrl] ||
    tooltips.quoteAlreadyAdded(quoteTarget.quoteUrl, innerPost))
      return;
    
    var placeHolder = document.createElement("div");
    placeHolder.style.whiteSpace = "normal";
    placeHolder.className = "inlineQuote";
    tooltips.loadTooltip(placeHolder, quoteTarget.quoteUrl, true, true);

	if (!placeHolder.getElementsByClassName("linkSelf"))
      return;
    
    var close = document.createElement("A");
    close.innerText = "X";
    close.onclick = function() {
      placeHolder.remove();
    }
    close.style.className = "closeInline";
    placeHolder.getElementsByClassName("postInfo")[0].prepend(close);
    
    Array.from(placeHolder.getElementsByClassName("quoteLink"))
      .forEach((a) => tooltips.processQuote(a, false, true));
    
    if (tooltips.bottomBacklinks) {
      var alts = placeHolder.getElementsByClassName("altBacklinks")[0].firstChild
      Array.from(alts.children)
        .forEach((a) => tooltips.processQuote(a, true));
    }

    if (isBacklink) {
      //innerPost.append(placeHolder);
      replyPreview.append(placeHolder);
    } else {
      quote.insertAdjacentElement("afterEnd", placeHolder);
    }
    
    tooltips.removeIfExists();
  })
}

tooltips.generateHTMLFromData = function(postingData, tooltip, quoteUrl) {

  if (!postingData) {
    return;
  }

  var quoteTarget = api.parsePostLink(quoteUrl);

  var tempDiv = posting.addPost(postingData, quoteTarget.board,
      quoteTarget.thread, undefined, undefined, true).getElementsByClassName('innerPost')[0];

  tooltips.postCache[quoteUrl] = tempDiv;

  return tempDiv.cloneNode(true);

};

//add tooltip dynamic content: backlinks, link underlining, (you)s
tooltips.addLoadedTooltip = function(htmlContents, tooltip, quoteUrl, replyId, isInline) {
  var quoteTarget = api.parsePostLink(quoteUrl);
  var board = quoteTarget.board;
  var thread = +quoteTarget.thread;
  var post = +quoteTarget.post;

  if (!htmlContents) {
    tooltip.innerText = 'Not found'; //TODO delete and disable hover?
    return;
  }

  Array.from(htmlContents.getElementsByClassName("inlineQuote")).forEach((q) => q.remove())
  
  var deletionCheckBox = htmlContents.getElementsByClassName('deletionCheckBox')[0];
  if (deletionCheckBox) {
    deletionCheckBox.remove();
  }

  // obtain the latest backlinks from the actual post
  // this has to be done now since backlinks change
  if (board === api.boardUri && thread === api.threadId) {
    var backContainer = tooltips.knownPosts[board][post ? post : thread];
    if (backContainer) {
      var contentBack = htmlContents.getElementsByClassName("panelBacklinks");
      Array.from(backContainer.container.children).forEach((backlink) => {
         Array.from(contentBack).forEach((panel) => {
           panel.append(backlink.cloneNode(true));
         })
      });
    }
  }
  
  tooltips.addReplyUnderline(htmlContents, board, replyId);
  
  //TODO move to HTML/node caching
  var yous = localStorage.getItem(board + "-yous");
  if (yous !== null && JSON.parse(yous).find((a) => a == post) !== undefined) {
    posting.markPostAsYou(undefined, htmlContents);
  }

  htmlContents.className = 'innerPost'; //for innerOPs
  if (tooltip.firstChild) {
    tooltip.firstChild.remove();
  }
  tooltip.append(htmlContents);

  if (isInline) {
    posting.parseExistingPost(tooltip.getElementsByClassName('linkSelf')[0], false, false, true);
  } else {
    tooltips.checkHeight(tooltip);
  }
}

tooltips.loadTooltip = function(tooltip, quoteUrl, replyId, isInline) {

  var matches = quoteUrl.match(/\/(\w+)\/res\/(\d+)\.html\#(\d+)/);

  var board = matches[1];
  var thread = +matches[2];
  var post = +matches[3];

  // try to find a quote that works

  if (tooltips.postCache[quoteUrl]) {
    var htmlContents = tooltips.postCache[quoteUrl].cloneNode(true);

	tooltips.addLoadedTooltip(htmlContents, tooltip, quoteUrl, replyId, isInline);
	return;
  }

  tooltip.innerText = 'Loading';

  // failed; find in cache

  var postingData = tooltips.externalThreadCache[board + '/' + post];

  tooltips.loadingPreviews[quoteUrl] = true;

  if (postingData) {
    var htmlContents = tooltips.generateHTMLFromData(postingData, tooltip, quoteUrl);
	tooltips.addLoadedTooltip(htmlContents, tooltip, quoteUrl, replyId, isInline);
    tooltips.loadingPreviews[quoteUrl] = false;
    return;
  }

  var threadUrl = '/' + board + '/res/' + thread + '.json';

  api.localRequest(threadUrl, function(error, data) {

    delete tooltips.loadingPreviews[quoteUrl];

    if (error) {
      tooltip.innerText = 'Not found';
      return;
    }

    var threadData = JSON.parse(data);
    tooltips.cacheData(threadData);

    var htmlContents = tooltips.generateHTMLFromData(
		tooltips.externalThreadCache[board + '/' + post], tooltip, quoteUrl);
	tooltips.addLoadedTooltip(htmlContents, tooltip, quoteUrl, replyId, isInline);

  });

};

tooltips.cacheData = function(threadData) {

  var linkStart = '/' + threadData.boardUri + '/res/' + threadData.threadId + '.html#';

  threadData.posts.forEach(function(postData) {
    var linkTo = location.origin + linkStart + postData.postId;
    //force regeneration
    if (tooltips.postCache[linkTo])
      delete tooltips.postCache[linkTo]
    tooltips.externalThreadCache[threadData.boardUri + '/' + postData.postId] = postData;
  })
  tooltips.externalThreadCache[threadData.boardUri + '/' + threadData.threadId] = threadData;

};

tooltips.init();
