var favoriteBoards = {};

favoriteBoards.init = function() {

  var burgerMenu = document.getElementById("sidebar-menu");
  Array.from(burgerMenu.getElementsByClassName("hidden"))
    .forEach((hidden) => { hidden.style.display = "list-item"; })

  favoriteBoards.setFavoriteBoards();
  favoriteBoards.setTopBoards();

  var boardLabel = document.getElementById('labelName')
      || document.getElementById('labelBoard');

  if (boardLabel && api.boardUri) {

    var savedFavoriteBoards = JSON.parse(localStorage.savedFavoriteBoards
        || '[]');

    var favoriteButton = document.createElement('input');
    favoriteButton.type = 'checkbox';
    favoriteButton.id = 'favoriteButton';

    var favoriteButtonLabel = document.createElement('label');
    favoriteButtonLabel.className = 'glowOnHover';
    favoriteButtonLabel.id = 'favoriteButtonLabel';
    favoriteButtonLabel.htmlFor = 'favoriteButton';
    favoriteButtonLabel.textContent = ' ';

    boardLabel.parentNode.appendChild(favoriteButton);
    boardLabel.parentNode.appendChild(favoriteButtonLabel);

    if (savedFavoriteBoards.indexOf(api.boardUri) > -1) {
      favoriteButton.checked = true;
    }

    favoriteButton.oninput = function() {
      savedFavoriteBoards = JSON.parse(localStorage.savedFavoriteBoards
          || '[]');

      var index = savedFavoriteBoards.indexOf(api.boardUri);

      savedFavoriteBoards.checked = index > -1;
      if (index > -1) {
        savedFavoriteBoards.splice(index, 1);
      } else {
        savedFavoriteBoards.push(api.boardUri);
        savedFavoriteBoards.sort();
      }

      localStorage.setItem('savedFavoriteBoards', JSON
          .stringify(savedFavoriteBoards));

      favoriteBoards.setFavoriteBoards();

    };

  }

};

favoriteBoards.createBoardList = function(boardSpan, boardList, dropdown) {
  if (!boardList.length) {
    return;
  }

  if (!dropdown) {

    var firstBracket = document.createElement('span');
    firstBracket.innerText = '[';
    boardSpan.appendChild(firstBracket);
    boardSpan.appendChild(document.createTextNode(' '));

    boardList.forEach((board, i) => {
      var link;
      link = document.createElement('a');
      link.href = '/' + board.boardUri;

      if (api.boardUri !== board.boardUri) {
      } else {
        // link = document.createElement('span');
        link.style.color = "var(--navbar-text-color)";
      }
      link.innerText = board.boardUri;
      boardSpan.appendChild(link);

      boardSpan.appendChild(document.createTextNode(' '));
      if (i < boardList.length - 1) {

        var divider = document.createElement('span');
        divider.innerText = '/';
        boardSpan.appendChild(divider);

        boardSpan.appendChild(document.createTextNode(' '));
      }
    })

    var secondBracket = document.createElement('span');
    secondBracket.innerText = ']';
    boardSpan.appendChild(secondBracket);
  
  } else {

    var mobileDropdown = document.createElement('select');
    mobileDropdown.className = "mobileBoardSelect";
    /*
    var defaultOption = document.createElement('option');
    defaultOption.textContent = "Top Boards";
    defaultOption.value = ' ';
    mobileDropdown.append(defaultOption);
    */

    boardList.forEach((board) => {
      var option = document.createElement('option');
      option.innerHTML = '/' + board.boardUri + '/' + (board.boardName ? ' - ' + board.boardName : "");
      option.value = board.boardUri;
      mobileDropdown.append(option);
      if (api.boardUri === board.boardUri) {
        option.selected = true;
      }
    })

    mobileDropdown.onchange = function() {
      console.log(mobileDropdown.value);
      if (mobileDropdown.value === ' ')
        return 
      document.location = '/' + mobileDropdown.value;
    }
    boardSpan.parentNode.insertBefore(mobileDropdown, boardSpan);
  }
}

favoriteBoards.setFavoriteBoards = function() {

  var savedFavoriteBoards = JSON.parse(localStorage.savedFavoriteBoards
      || '[]');

  var boardsSpan = document.getElementById('navBoardsSpan');

  while (boardsSpan.hasChildNodes()) {
    boardsSpan.removeChild(boardsSpan.lastChild);
  }

  favoriteBoards.createBoardList(boardsSpan, 
    savedFavoriteBoards.map(i => {return {boardUri: i, boardName: ""}}) );

};

favoriteBoards.setTopBoards = function() {
  var topBoardsGetter = new XMLHttpRequest();
  topBoardsGetter.open("GET", "/index.json");
  topBoardsGetter.onload = function(e) {
    var topBoards = JSON.parse(e.target.responseText || '{"topBoards": []}').topBoards

    var boardsSpan = document.getElementById('navTopBoardsSpan');

    while (boardsSpan.hasChildNodes()) {
      boardsSpan.removeChild(boardsSpan.lastChild);
    }

    favoriteBoards.createBoardList(boardsSpan, topBoards, api.mobile);

  }
  topBoardsGetter.send()
};

favoriteBoards.init();
