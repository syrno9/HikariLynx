var theme = {};

theme.themes = [ {
      label : 'Default CSS',
      id : 'custom'
  }, {
      label : 'Hikari3',
      id : 'yotsuba_b'
  }, {
	  label : 'Tomorow',
	  id : 'tomorrow',
  }, {
	  label : 'Yotsuba B',
	  id : 'yotsuba-b',
  }, {
	  label : 'Futaba',
	  id : 'futaba',
  }
];

theme.themeLink = undefined;
theme.globalTheme = undefined;
theme.customCssHref = "";

theme.addThemeSelector = function() {

  var themesBefore = document.getElementById('themesBefore');

  if (!themesBefore) {
    return
  }

  var referenceNode = themesBefore.previousSibling.previousSibling;
 
  themesBefore.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);
  
  themesBefore.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);
 
  var themeSelector = document.createElement('select');
  themeSelector.id = 'themeSelector';
 
  /*
  var vanillaOption = document.createElement('option');
  vanillaOption.innerText = 'Default';
  themeSelector.appendChild(vanillaOption);
  */
 
  theme.themes.forEach((theme) => {
 
    var themeOption = document.createElement('option');
    themeOption.innerText = theme.label;
 
    if (theme.id === localStorage.selectedTheme) {
      themeOption.selected = true;
    }
 
    themeSelector.appendChild(themeOption);
 
  })
 
  var changeTheme = function(e) {
 
    var selectedTheme = theme.themes[e.target.selectedIndex];
 
    if (selectedTheme.id === localStorage.selectedTheme) {
      return;
    }
 
    localStorage.selectedTheme = selectedTheme.id;
 
    theme.load();
 
  };

  themeSelector.onchange = changeTheme;
 
  themesBefore.parentNode.insertBefore(themeSelector, referenceNode);
 
  themesBefore.parentNode.insertBefore(document.createTextNode(' '),
      referenceNode);

  var secondSelector = themeSelector.cloneNode(true);
  secondSelector.onchange = changeTheme;

  var sideMenu = document.getElementById("sidebar-menu");
  if (sideMenu) 
    // sideMenu.append(secondSelector);
    sideMenu.insertBefore(secondSelector, sideMenu.children[0].nextSibling);

};

theme.load = function(init) {

  var currentTheme = localStorage.selectedTheme;

  //loading a custom theme
  if (currentTheme === 'custom') {
    // document.body.className = 'theme_board'; //shouldn't be necessary anymore
    theme.themeLink.href = theme.customCssHref;
    if (theme.globalTheme !== undefined) {
      document.head.insertBefore(theme.globalTheme, document.getElementById("nullSyntax"));
    }
  //loading a non-custom theme
  } else {
    // document.body.className = 'theme_' + currentTheme;
    theme.themeLink.href = '/.static/css/' + currentTheme + '.css';
    if (theme.globalTheme !== undefined) {
      theme.globalTheme.remove();
    }
  }
};

document.addEventListener("DOMContentLoaded", function() {
  var ending = '/custom.css';
  
  //if there's a `link` element with "custom.css", then remember it
  var loadedCss = document.getElementsByTagName('link');
  for (var i in Array.from(loadedCss)) {
	var cssHref = loadedCss[i].href;
  
    if (cssHref !== undefined && cssHref.indexOf(ending) === 
	cssHref.length - ending.length) {
      theme.customCssHref = cssHref;
      loadedCss[i].remove();
      break;
    }

    if (loadedCss[i].className === "globalTheme") {
      theme.globalTheme = loadedCss[i];
    }
  }

  theme.themeLink = document.createElement("link")
  theme.themeLink.type = "text/css";
  theme.themeLink.rel = "stylesheet";
  theme.themeLink.id = "themeLink";
  document.head.insertBefore(theme.themeLink, document.getElementById("nullSyntax"));

  var currentTheme = localStorage.selectedTheme;
  localStorage.selectedTheme = currentTheme === undefined ?
	theme.themes[0].id : currentTheme;

  theme.addThemeSelector();

  theme.load(true);
});
