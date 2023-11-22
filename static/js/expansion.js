function expandThreadHandler(tThread, expandLink) {
  var missing = expandLink.missing;
  var divPost=tThread.querySelector('.divPosts');
  insertPoint=divPost.children[0];
  var postHtml={};
  var lastDisplayed=0;

  function checkDone() {
    var weHaveUpTo=missing.length;
    for(var n in missing) {
      // find the first missing post
      if (!postHtml[n]) {
        weHaveUpTo=n-1;
        break;
      }
    }
    var startAdding=0;
    if (lastDisplayed<weHaveUpTo) {
      // if nothing displayed then start
      if (lastDisplayed===0) {
        startAdding=1;
      }
      // start inserting
      for(var m in missing) {
        if (startAdding) {
          // if they click collapse, stop adding
          if (expandLink.expanded) {
            // actually add post
            // is the postCell's ID set?
            var insertedNode = divPost.insertBefore(postHtml[m], insertPoint);
            // Do post processing for: quoting, timezones, hidepost posts
            // needs postCell
            processPostCell(insertedNode);
          }
        }
        if (m==lastDisplayed) {
          startAdding=1;
        }
        if (m==weHaveUpTo) {
          startAdding=0;
          lastDisplayed=parseInt(m);
          break;
        }
      }
      // done inserting
      // update IDs
      var ids = document.getElementsByClassName('labelId');
      // build idsRelation
      for (i = 0; i < ids.length; i++) {
        processIdLabel(ids[i]); // brings lookup up to date
      }
      if (updateIdLabels) {
        updateIdLabels();
      } else {
        console.log("expansion.js - updateIdLabels dne")
      }
      expandLink.expandingState=false;
    }
  }

  for(var l in missing) {
    var previewUrl = '/' + boardUri + '/preview/' + missing[l] + '.html';
    var scope=function(missing, l) {
      if (!postHtml[l]) {
        localRequest(previewUrl, function receivedData(error, html) {
          var newDiv=document.createElement('div');
          // strip these off the preview
          var start='<div id="panelContent"><div class="postCell">';
          var end='</div></div>';
          newDiv.innerHTML=html.substring(html.indexOf(start)+start.length, html.indexOf(end))+'</div>';
          newDiv.className='postCell';
          newDiv.id=missing[l]+'';
          postHtml[l]=newDiv;
          // add to the top
          checkDone();
        });
      } else {
        checkDone();
      }
    }(missing, l);
  }
}

// find all threads
var threads=document.querySelectorAll('.opCell');
for(var i=0; i<threads.length; i++) {
  var tThread=threads[i];
  var labelOmission=tThread.querySelector('.labelOmission');
  if (labelOmission) {
    var expandLink=document.createElement('a');
    expandLink.href='javascript:';
    expandLink.expanded=0;
    expandLink.expandingState=false;
    var scope=function(tThread, expandLink) {
      expandLink.onclick=function() {
        if (expandLink.expandingState) {
          console.log('need to queue request, state:', expandLink.expanded);
          return;
        }
        if (!expandLink.expanded) {
          expandLink.expandingState=true;
          //console.log('expanding', tThread);
          var havePosts={};
          var postCells=document.querySelectorAll('.postCell');
          var insertPoint;
          // inventory what posts we currently have
          for(var j=0; j<postCells.length; j++) {
            var cell=postCells[j];
            if (cell.id) {
              //console.log('registering', cell.id);
              havePosts[cell.id]=cell;
              //insertPoint=cell;
            } else {
              console.log('expansion.js - expand, cell without id', cell);
            }
          }

          // have we expanded before?
          if (expandLink.missing) {
            // we have expanded before
            console.log('re-expanding');
            expandThreadHandler(tThread, expandLink);
          } else {
            console.log('expanding');
            //libajaxget('/'+board+'/res/'+tThread.id+'.json', function(json) {
            var threadJsonUrl = '/' + boardUri + '/res/' + tThread.id + '.json';
            //console.log('threadJsonUrl', threadJsonUrl);
            localRequest(threadJsonUrl, function receivedData(error, json) {
              //console.log('got json', json);
              // determine last shown posts
              // scan ids in divPosts
              if (!json) {
                return;
              }
              expandLink.expanded=1;
              expandLink.innerText='Collapse Thread';
              var obj=JSON.parse(json);
              var missing=[];
              var posts={};
              for(var k in obj.posts) {
                var post=obj.posts[k];
                posts[post.postId]=post;
                if (!havePosts[post.postId]) {
                  missing.push(post.postId);
                } else {
                  //console.log('we have', post.postId);
                }
              }
              expandLink.missing=missing;
              expandThreadHandler(tThread, expandLink);
            });
          }
        } else {
          console.log('collapsing');
          expandLink.expandingState=true;
          expandLink.expanded=0;
          expandLink.innerText='Expand Thread';
          var missing=expandLink.missing;
          var havePosts={};
          var postCells=document.querySelectorAll('.postCell');
          for(var j=0; j<postCells.length; j++) {
            var cell=postCells[j];
            if (cell.id) {
              //console.log('registering', cell.id);
              havePosts[cell.id]=cell;
              //insertPoint=cell;
            } else {
              console.log('expansion.js - collapse, cell without id', cell);
            }
          }
          var divPost=tThread.querySelector('.divPosts');
          for(var l in missing) {
            // find
            if (havePosts[missing[l]]) {
              divPost.removeChild(havePosts[missing[l]]);
            } else {
              console.log('expansion.js - collapse, cant find', missing[l]);
            }
          }
          //console.log('havePosts', havePosts);
          expandLink.expandingState=false;
        }
      }
    }(tThread, expandLink);
    expandLink.appendChild(document.createTextNode('Expand thread'));
    labelOmission.appendChild(expandLink);
  }
}
