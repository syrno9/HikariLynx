var interfaceUtils = {};
// TODO: right open/right close suppress the other 
interfaceUtils.openSideMenus = {right: false, left: false};
interfaceUtils.TOUCH_THRESHOLD = 50; // number of pixels in a slide
interfaceUtils.TOUCH_ANGLE = 0.5;    // maximum slope allowed for gesture

interfaceUtils.shownMenu = undefined;

interfaceUtils.addModalRow = function(label, element) {

  var tableBody = document.getElementsByClassName('modalTableBody')[0];

  //element with this class already added, so the row is likely a duplicate
  if (tableBody.getElementsByClassName(element.className).length > 1) {
    return
  }

  var tableRow = document.createElement('tr');
  tableBody.appendChild(tableRow);

  var labelElement = document.createElement('th');
  labelElement.textContent = label;

  tableRow.appendChild(labelElement);

  var fieldHolder = document.createElement('td');

  fieldHolder.appendChild(element);

  tableRow.appendChild(fieldHolder);
};

interfaceUtils.getModal = function(header, noCaptcha) {

  var outerPanel = document.createElement('div');
  outerPanel.className = 'modalPanel';
  document.body.appendChild(outerPanel);

  var innerPanel = document.createElement('div');
  innerPanel.className = 'modalInnerPanel';
  outerPanel.appendChild(innerPanel);

  var modalForm = document.createElement('form');
  modalForm.className = 'modalForm';
  innerPanel.appendChild(modalForm);

  var topLabel = document.createElement('h3');
  topLabel.textContent = header;
  modalForm.appendChild(topLabel);

  if (!noCaptcha) {
    document.cookie = 'captchaid=; path=/;';

    var captchaImage = document.createElement('img');
    captchaImage.src = '/captcha.js?d=' + new Date().toString();
    captchaImage.className = 'captchaImage';
    modalForm.appendChild(captchaImage);

    var captchaControls = document.createElement('span');
    captchaControls.className = 'modalCaptchaControls';
    modalForm.appendChild(captchaControls);

    var reloadButton = document.createElement('input');
    reloadButton.value = 'Reload';
    reloadButton.addEventListener('click', function() {
      captchaUtils.reloadCaptcha()
    });
    reloadButton.type = 'button';
    captchaControls.appendChild(reloadButton);

    var reloadTimer = document.createElement('span');
    reloadTimer.className = 'captchaTimer';
    captchaControls.appendChild(reloadTimer);

  }

  var captchaTable = document.createElement('table');
  var tableBody = document.createElement('tbody');
  tableBody.className = 'modalTableBody';
  captchaTable.appendChild(tableBody);
  modalForm.appendChild(captchaTable);

  var okButton = document.createElement('input');
  okButton.type = 'submit';
  okButton.className = 'modalOkButton';
  okButton.value = 'Ok';

  if (!noCaptcha) {

    var captchaField = document.createElement('input');
    captchaField.type = 'text';
    captchaField.className = 'modalAnswer';
    captchaField.focus();

    interfaceUtils.addModalRow('Answer', captchaField);

  }

  var responseButtonsPanel = document.createElement('span');
  modalForm.appendChild(responseButtonsPanel);

  responseButtonsPanel.appendChild(okButton);

  var cancelButton = document.createElement('input');
  cancelButton.type = 'button';
  cancelButton.value = 'Cancel';
  cancelButton.onclick = function() {
    outerPanel.remove();
  };
  responseButtonsPanel.appendChild(cancelButton);

  return outerPanel;

};

interfaceUtils.setDraggable = function(element, dragElement) {

  var dragglableInfo = {};

  var stopMoving = function() {

    if (!dragglableInfo.shouldMove) {
      return;
    }

    dragglableInfo.shouldMove = false
    interfaceUtils.lockedDrag = false

    var body = document.getElementsByTagName('body')[0];

    body.onmouseup = dragglableInfo.originalMouseUp;

  };

  var startMoving = function(evt) {

    if (evt.button != 0 || dragglableInfo.shouldMove || interfaceUtils.lockedDrag) {
      return;
    }

    evt.preventDefault();

    interfaceUtils.lockedDrag = true;

    dragglableInfo.originalMouseUp = document.body.onmouseup;

    document.body.onmouseup = function() {
      stopMoving();
    };

    dragglableInfo.shouldMove = true;

    evt = evt || window.event;

    var rect = element.getBoundingClientRect();

    dragglableInfo.diffX = evt.clientX - rect.left;
    dragglableInfo.diffY = evt.clientY - rect.top;

  };

  var move = function(evt) {

    if (!dragglableInfo.shouldMove) {
      return;
    }

    evt = evt || window.event;

    var newX = evt.clientX - dragglableInfo.diffX;
    var newY = evt.clientY - dragglableInfo.diffY;

    if (newX < 0) {
      newX = 0;
    }

    if (newY < 0) {
      newY = 0;
    }

    var upperXLimit = document.body.clientWidth - element.offsetWidth;

    if (newX > upperXLimit) {
      newX = upperXLimit;
    }

    var upperYLimit = Math.max(0,window.innerHeight - element.offsetHeight);

    if (newY > upperYLimit) {
      newY = upperYLimit;
    }

    element.style.left = newX + 'px';
    element.style.top = newY + 'px';

  };

  dragElement.onmousedown = startMoving
  document.body.addEventListener('mousemove', move);
};

interfaceUtils.buildFloatingMenu = function(menuId, labelContents) {

  var menuContainer = document.getElementById(menuId);
  if (menuContainer)
    return menuContainer;

  menuContainer = document.createElement('div');

  var menuHandle = document.createElement('div');
  menuHandle.className = 'handle';
  menuContainer.appendChild(menuHandle);

  menuContainer.id = menuId;
  menuContainer.className = 'floatingMenu';

  interfaceUtils.setDraggable(menuContainer, menuHandle);

  document.body.appendChild(menuContainer);

  var menuLabel = document.createElement('label');
  menuLabel.textContent = labelContents;

  menuHandle.appendChild(menuLabel);

  var showingWatched = false;

  var closeButton = document.createElement('span');
  closeButton.className = 'coloredIcon glowOnHover close-btn';
  closeButton.onclick = function() {
    menuContainer.style.display = 'none';
  };

  menuHandle.appendChild(closeButton);

  menuContainer.appendChild(document.createElement('hr'));

  var floatingContainer = document.createElement('div');
  floatingContainer.className = "floatingContainer";
  menuContainer.appendChild(floatingContainer);

  return floatingContainer;
}

// insert extra menu on user post
// @post:		post object generated by posting.parseExistingPost
// @title: 		string, the hover text on the button to make
// @buttonClass:	string, the CSS class of the button
// @buildMenu:	function of a single argument (linkSelf) which returns a list
// 				of objects whose entries have members 'name' and 'callback'; 
// 				the latter is called when clicking the corresponding entry
interfaceUtils.addMenuDropdown = function(post, title, buttonClass, buildMenu) {

  var parentNode = post.linkSelf.parentNode;
  var postButton = parentNode.getElementsByClassName('postButton')[0];
  var checkbox = parentNode.getElementsByClassName('deletionCheckBox')[0];
  var actions = buildMenu(post);

  var dropdownButton = document.createElement('label');
  dropdownButton.className = buttonClass + ' glowOnHover coloredIcon';
  dropdownButton.title = title;

  parentNode.insertBefore(dropdownButton, postButton ? postButton.nextSibling
      : parentNode.childNodes[0]);

  if (api.mobile) {
    var mobileSelect = document.createElement("select");
    mobileSelect.className = "mobileSelect";
    dropdownButton.appendChild(mobileSelect);

    var exitOption = document.createElement('option');
    exitOption.textContent = "--CLOSE--";
    mobileSelect.appendChild(exitOption);

    actions.forEach((o) => {
      var option = document.createElement('option');
      option.textContent = o.name;
      mobileSelect.appendChild(option);
    });

    mobileSelect.onchange = function() { 
      var action = mobileSelect.selectedIndex - 1;
      if (action >= 0)
        actions[action].callback();       
    };

    return dropdownButton;
  }

  dropdownButton.onclick = function() {

    var extraMenu = document.createElement('div');
    extraMenu.className = 'floatingList extraMenu';
    dropdownButton.appendChild(extraMenu);
    interfaceUtils.shownMenu = extraMenu;

    var list = document.createElement('ul');
    extraMenu.appendChild(list);

    buildMenu(post).forEach((o) => {
      var button = document.createElement('li');
      button.textContent = o.name;
      button.onclick = o.callback;
      list.appendChild(button);
    });
  };

  return dropdownButton;
};

interfaceUtils.buildTable = function(tableClass, tableId="") {
  let newTable = document.createElement('table');
  newTable.className = "table " + tableClass ? tableClass : '';
  newTable.id = tableId;
  return newTable;
}

interfaceUtils.buildTableRows = function(table, rows) {
  rows.forEach(function(row) {
    let tr = document.createElement('tr');
    row.forEach(function(item) {
      let td = document.createElement('td');
      td.appendChild(item.el);
      if (item.class) td.className = item.class;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  return table;
}

// create a tabbed list of content to selectively display, appended to parentDiv
// @parentDiv:	parent node to which to append tab content
// @tabs: 		list of objects with members "name", the title of the tab;
// 				"content", HTML nodes to show when the tab is selected; and
// 				optionally "select", whether to show the contents immediately
interfaceUtils.buildTabbedMenu = function(parentDiv, tabs) {

  let currentTab;
  let currentPanel;

  tabsDiv = document.createElement('div');
  parentDiv.appendChild(tabsDiv);

  menuContentPanel = document.createElement('div');
  menuContentPanel.className = "menuContentPanel";
  parentDiv.appendChild(menuContentPanel);

  tabs.forEach(tab => {
  
    var newTab = document.createElement('span');
    newTab.textContent = tab.name;
    newTab.className = 'settingsTab';
    newTab.onclick = function() {
      if (newTab === currentTab) {
        return;
      }

      if (currentTab) {
        currentTab.classList.remove('selectedTab');
        currentPanel.classList.remove('selectedPanel');
      }

      newTab.classList.add('selectedTab');
      tab.content.classList.add('selectedPanel');

      currentTab = newTab;
      currentPanel = tab.content;
    };
    tabsDiv.appendChild(newTab);
    menuContentPanel.appendChild(tab.content);
  
    if (tab.select) {
      newTab.onclick();
    }

  })

  return [tabsDiv, menuContentPanel];
}

// add a `callback` to run when a slide to the `direction` is completed
interfaceUtils.addSlide = function(element, direction, callback) {
  var touchStartX = undefined;
  var touchStartY = undefined;
  var lastX = undefined;
  var lastY = undefined;
  var touchLength = undefined;

  var sliding = false;
  const dirSign = direction === "left" ? 1 : -1;

  element.addEventListener('touchstart', function(e) {
    if (e.touches.length != 1)
      return 
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

    lastX = touchStartX;
    lastY = touchStartY;

    touchLength = 0;
  })

  element.addEventListener('touchmove', function(e) {
    if (e.touches.length != 1 || touchStartX === undefined)
      return;

    var currentX = e.touches[0].clientX;
    var currentY = e.touches[0].clientY;

	touchLength += (lastX - currentX)**2 + (lastY - currentY)**2;

    // if we've drifted too far from the origin point
    if (!sliding && touchLength > 4*interfaceUtils.TOUCH_THRESHOLD**2) {
      touchStartX = undefined
      touchStartY = undefined
      return;
    }

    var deltaX = touchStartX - currentX;
    var deltaY = touchStartY - currentY;

    // ignore if too small or wrong direction
    if (Math.abs(deltaX) < interfaceUtils.TOUCH_THRESHOLD 
    || Math.sign(deltaX * dirSign) < 0) {
      lastX = currentX;
      lastY = currentY;
      return;
    }
    // or if the slope is too big
    if (Math.abs(deltaY / deltaX) > interfaceUtils.TOUCH_ANGLE) {
      lastX = currentX;
      lastY = currentY;
      return;
    }
    // or if we've started a selection
    if ( document.getSelection && document.getSelection().type !== "None" )
      return;

    sliding = true;
    callback(e, deltaX);
  })

  element.addEventListener('touchend', function(e) {
    if (sliding && !e.cancelable ) {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
    }
    touchStartX = undefined;
    touchStartY = undefined;
    lastX = undefined;
    lastY = undefined;
    touchLength = undefined;

    sliding = false;
  })
}

document.addEventListener('click', function() {
  if (interfaceUtils.shownMenu) {
    interfaceUtils.shownMenu.remove();
    delete interfaceUtils.shownMenu;
  }
}, true)

document.addEventListener("DOMContentLoaded", function() {
  var hamburgerCheck = document.getElementById("mobile-hamburger");
  var leftSideMenu = document.getElementById("sidebar-menu");

  interfaceUtils.addSlide(document.body, 'right', function(e, delta) {
    if (interfaceUtils.openSideMenus['right']) {
      // TODO: close right menu
      return;
    }
    hamburgerCheck.checked = true;

    var left = Math.max(-200 + delta, 0);
    if (left < 0) {
      rightSideMenu.style.left = left + "px";
    } else {
      rightSideMenu.style.left = null;
    }
    interfaceUtils.openSideMenus['left'] = true;
  });

  var sideCatalogCheck = document.getElementById("showSideCatalog");
  var rightSideMenu = document.getElementById("sideCatalogDiv");

  if (sideCatalogCheck !== undefined && rightSideMenu !== undefined) {

    interfaceUtils.addSlide(document.body, 'left', function(e, delta) {
      if (interfaceUtils.openSideMenus['left']) {
        // TODO: close left menu
        return;
      }
      sideCatalogCheck.checked = true;
      sideCatalog.refreshSideCatalog();
  
      var right = Math.max(-200 + delta, 0);
      if (right < 0) {
        rightSideMenu.style.right = right + "px";
      } else {
        rightSideMenu.style.right = null;
      }
      
      interfaceUtils.openSideMenus['right'] = true;
    });

  }

  hamburgerCheck.addEventListener('change', function(e) {
    if (hamburgerCheck.checked)
      return;

    leftSideMenu.style.left = null;
    interfaceUtils.openSideMenus['left'] = false;
  })

  if (sideCatalogCheck) {
    sideCatalogCheck.addEventListener('change', function(e) {
      if (hamburgerCheck.checked || !api.mobile)
        return;

      rightSideMenu.style.right = null;
      interfaceUtils.openSideMenus['right'] = false;
    })
  }
})
