var multiboardMenu = {};

multiboardMenu.init = function() {

  var multiboardMenuDiv = interfaceUtils.buildFloatingMenu('multiboardMenu', 'Multiboard');
  multiboardMenuDiv.parentNode.style.display = 'none';

  Array.from(document.getElementsByClassName('multiboardButton'))
    .forEach((multiboardButton) => {
      multiboardButton.title = "Multiboard";
    
      multiboardButton.onclick = function() {
        if (multiboardMenuDiv.parentNode.style.display == 'block')
          multiboardMenuDiv.parentNode.style.display = 'none';
        else
          multiboardMenuDiv.parentNode.style.display = 'block';
      }
  });

  var helpButton = document.createElement('span');
  helpButton.title = "Multiboards work similarly to the Overboard, but are " + 
                     "customizable.\nJust combine board names with '+' to view " +
                     "their contents in one multiboard.\nExample: /site+test/ " +
                     "will let you browse both /site/ and /test/ at the same time.";
  helpButton.className = "coloredIcon glowOnHover help-btn";

  var closeButton = multiboardMenuDiv.parentNode.getElementsByClassName('close-btn')[0];
  closeButton.parentNode.insertBefore(helpButton, closeButton.nextSibling);

  multiboardMenu.savedBoards = JSON.parse(localStorage.getItem('multiboards') || '[]');
  multiboardMenu.newestIndex = multiboardMenu.savedBoards.reduce((i, a) => Math.max(i.index, a), 0);

  multiboardMenuDiv.appendChild(multiboardMenu.getMainContent());
  
};

multiboardMenu.getMainContent = function() {
  var mainPanel = document.createElement('div');

  let multiboardTable = interfaceUtils.buildTable("table table-striped");

  var newMultiboardForm = document.createElement('span');
  newMultiboardForm.className = 'formPanelContainer';
  mainPanel.appendChild(newMultiboardForm);

  var newMBNameInput = document.createElement('input');
  newMBNameInput.id = "new-multiboard-name";
  newMBNameInput.placeholder = 'Name (optional)';
  newMBNameInput.type = "text";

  var newMBStringInput = document.createElement('input');
  newMBStringInput.id = "new-multiboard-string";
  newMBStringInput.placeholder = "site+test+...";
  newMBStringInput.type = "text";

  var stringInputLabel = document.createElement('label');
  stringInputLabel.appendChild(document.createTextNode('/'));
  stringInputLabel.appendChild(newMBStringInput);
  stringInputLabel.appendChild(document.createTextNode('/'));

  var newMBSaveButton = document.createElement('button');
  newMBSaveButton.innerText = 'Save';

  newMultiboardForm.appendChild(newMBNameInput);
  newMultiboardForm.appendChild(stringInputLabel);
  newMultiboardForm.appendChild(newMBSaveButton);

  newMBSaveButton.onclick = function() {
    var newName = newMBNameInput.value;
    var newString = newMBStringInput.value.trim();

	Promise.all(newString.split('+').map(b => fetch('/' + b)))
	.then(ps => {
      // only the valid boards; warn about invalid ones
      let errors = ps.filter(i => i.status !== 200);

      if (!ps || errors.length === ps.length) {
        alert("Aborted: no valid boards were specified.");
        return;
      } else if (errors.length > 0) {
        alert("Some boards do not exist: " + errors.map(e => e.url.split('/')[3]).join(', '));
      }

      var newMBObject = {};
      newMBObject.name = newName;
      newMBObject.boards = newString;
      newMBObject.index = multiboardMenu.newestIndex++;

      if (multiboardMenu.savedBoards) {
        multiboardMenu.savedBoards.push(newMBObject)
        localStorage.setItem('multiboards', JSON.stringify(multiboardMenu.savedBoards));
      }
      else {
        var boards = [];
        boards.push(newMBObject);
        localStorage.setItem('multiboards', JSON.stringify(boards));
      }
      // newMBNameInput.value = "";
      // newMBStringInput.value = "";

      multiboardMenu.addMultiboardRow(multiboardTable, newMBObject);
    })
  };

  let saveAfter = false;
  multiboardMenu.savedBoards.forEach((b) => {
    if (b.index === undefined) {
      b.index = multiboardMenu.newestIndex++;
      saveAfter = true;
    }
    multiboardMenu.addMultiboardRow(multiboardTable, b);
  });

  if (saveAfter)
    localStorage.setItem('multiboards', JSON.stringify(multiboardMenu.savedBoards));

  mainPanel.appendChild(multiboardTable);
  return mainPanel;
};

multiboardMenu.addMultiboardRow = function(multiboardTable, mbObject) {
    let a = document.createElement('a');
    a.href = "/" + mbObject.boards + "/";
    a.innerText = mbObject.name;
    if (!mbObject.name) {
      let text = mbObject.boards;
      a.innerText = "/" + (text.length > 45 ? text.substring(0, 44) + '...' : text) + "/";
    }
       
    a.title = mbObject.boards;

    let btn = document.createElement('span');
    btn.className = "coloredIcon glowOnHover delete-btn";
    btn.onclick = function () {
      multiboardMenu.savedBoards.splice(mbObject.index, 1);
      localStorage.setItem('multiboards', JSON.stringify(multiboardMenu.savedBoards));
      a.parentNode.parentNode.remove();
    };

    interfaceUtils.buildTableRows(multiboardTable, [[
      {"el": a, "class": "mb-cell-string"}, 
      {"el": btn, "class": "mb-cell-delete"}
    ]]);
}


multiboardMenu.getSetupContent = function() {
    var setupPanel = document.createElement('div');
    setupPanel.className = "panelContents";

    var newMBNameInput = document.createElement('input');
    newMBNameInput.id = "new-multiboard-name";
    newMBNameInput.placeholder = 'Name (optional)';
    newMBNameInput.type = "text";

    var newMBStringInput = document.createElement('input');
    newMBStringInput.id = "new-multiboard-string";
    newMBStringInput.placeholder = "site+test+...";
    newMBStringInput.type = "text";

    var stringInputLabel = document.createElement('label');
    stringInputLabel.appendChild(document.createTextNode('/'));
    stringInputLabel.appendChild(newMBStringInput);
    stringInputLabel.appendChild(document.createTextNode('/'));

    var newMBSaveButton = document.createElement('button');
    newMBSaveButton.innerText = 'Save';

    setupPanel.appendChild(newMBNameInput);
    setupPanel.appendChild(stringInputLabel);
    setupPanel.appendChild(newMBSaveButton);

    newMBSaveButton.onclick = multiboardMenu.createMultiboard;

    return setupPanel;
};

multiboardMenu.init();
