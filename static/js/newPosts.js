  var divLatestPostsContainer = document.getElementById('divLatestPosts');
  var latestPostCells = divLatestPostsContainer.getElementsByClassName('latestPostCell');

  var newContainer = document.getElementById('latestPosts');
  var newElement = document.createElement('div');

  for (var i = 0; i < latestPostCells.length; i++) {
    var content = latestPostCells[i].innerHTML;

    newElement.innerHTML += content;

    if (i < latestPostCells.length - 1) {
      newElement.innerHTML += '<hr>';
    }
  }

  newContainer.appendChild(newElement);