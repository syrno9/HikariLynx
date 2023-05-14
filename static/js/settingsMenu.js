var settingsMenu = {};

settingsMenu.init = function() {

  settingsMenu.loadedFilters = JSON.parse(localStorage.filterData || '[]');
  settingsMenu.filterTypes = [ 'Name', 'Tripcode', 'Subject', 'Message', 'Id' ];

  settingsMenu.syntaxThemes = [{cssFile: "", name: "(From Theme)"}
    ,{cssFile: "a11y-dark.css", name: "A11Y Dark"}
    ,{cssFile: "agate.css", name: "Agate"}
    ,{cssFile: "an-old-hope.css", name: "An Old Hope"}
    ,{cssFile: "androidstudio.css", name: "Android Studio"}
    ,{cssFile: "arduino-light.css", name: "Arduino Light"}
    ,{cssFile: "arta.css", name: "Arta"}
    ,{cssFile: "ascetic.css", name: "Ascetic"}
    ,{cssFile: "atelier-cave-dark.css", name: "Atelier Cave Dark"}
    ,{cssFile: "atelier-cave-light.css", name: "Atelier Cave Light"}
    ,{cssFile: "atelier-dune-dark.css", name: "Atelier Dune Dark"}
    ,{cssFile: "atelier-dune-light.css", name: "Atelier Dune Light"}
    ,{cssFile: "atelier-estuary-dark.css", name: "Atelier Estuary Dark"}
    ,{cssFile: "atelier-estuary-light.css", name: "Atelier Estuary Light"}
    ,{cssFile: "atelier-forest-dark.css", name: "Atelier Forest Dark"}
    ,{cssFile: "atelier-forest-light.css", name: "Atelier Forest Light"}
    ,{cssFile: "atelier-heath-dark.css", name: "Atelier Heath Dark"}
    ,{cssFile: "atelier-heath-light.css", name: "Atelier Heath Light"}
    ,{cssFile: "atelier-lakeside-dark.css", name: "Atelier Lakeside Dark"}
    ,{cssFile: "atelier-lakeside-light.css", name: "Atelier Lakeside Light"}
    ,{cssFile: "atelier-plateau-dark.css", name: "Atelier Plateau Dark"}
    ,{cssFile: "atelier-plateau-light.css", name: "Atelier Plateau Light"}
    ,{cssFile: "atelier-savanna-dark.css", name: "Atelier Savanna Dark"}
    ,{cssFile: "atelier-savanna-light.css", name: "Atelier Savanna Light"}
    ,{cssFile: "atelier-seaside-dark.css", name: "Atelier Seaside Dark"}
    ,{cssFile: "atelier-seaside-light.css", name: "Atelier Seaside Light"}
    ,{cssFile: "atelier-sulphurpool-dark.css", name: "Atelier Sulphurpool Dark"}
    ,{cssFile: "atelier-sulphurpool-light.css", name: "Atelier Sulphurpool Light"}
    ,{cssFile: "atom-one-dark-reasonable.css", name: "Atom One Dark Reasonable"}
    ,{cssFile: "atom-one-dark.css", name: "Atom One Dark"}
    ,{cssFile: "atom-one-light.css", name: "Atom One Light"}
    ,{cssFile: "brown-paper.css", name: "Brown Paper"}
    ,{cssFile: "codepen-embed.css", name: "Codepen Embed"}
    ,{cssFile: "color-brewer.css", name: "Color Brewer"}
    ,{cssFile: "darcula.css", name: "Darcula"}
    ,{cssFile: "dark.css", name: "Dark"}
    ,{cssFile: "default.css", name: "Default"}
    ,{cssFile: "docco.css", name: "Docco"}
    ,{cssFile: "dracula.css", name: "Dracula"}
    ,{cssFile: "far.css", name: "Far"}
    ,{cssFile: "foundation-modified.css", name: "Foundation Modified"}
    ,{cssFile: "foundation.css", name: "Foundation"}
    ,{cssFile: "github-gist.css", name: "Github Gist"}
    ,{cssFile: "github.css", name: "Github"}
    ,{cssFile: "gml.css", name: "GML"}
    ,{cssFile: "googlecode.css", name: "Google Code"}
    ,{cssFile: "gradient-dark.css", name: "Gradient Dark"}
    ,{cssFile: "gradient-light.css", name: "Gradient Light"}
    ,{cssFile: "grayscale.css", name: "Grayscale"}
    ,{cssFile: "gruvbox-dark.css", name: "Gruvbox Dark"}
    ,{cssFile: "gruvbox-light.css", name: "Gruvbox Light"}
    ,{cssFile: "hopscotch.css", name: "Hopscotch"}
    ,{cssFile: "hybrid.css", name: "Hybrid"}
    ,{cssFile: "idea.css", name: "Idea"}
    ,{cssFile: "ir-black.css", name: "IR Black"}
    ,{cssFile: "isbl-editor-dark.css", name: "ISBL Editor Dark"}
    ,{cssFile: "isbl-editor-light.css", name: "ISBL Editor Light"}
    ,{cssFile: "kimbie.dark.css", name: "Kimbie Dark"}
    ,{cssFile: "kimbie.light.css", name: "Kimbie Light"}
    ,{cssFile: "lightfair.css", name: "Lightfair"}
    ,{cssFile: "lioshi.css", name: "Lioshi"}
    ,{cssFile: "magula.css", name: "Magula"}
    ,{cssFile: "mono-blue.css", name: "Mono Blue"}
    ,{cssFile: "monokai-sublime.css", name: "Monokai Sublime"}
    ,{cssFile: "monokai.css", name: "Monokai"}
    ,{cssFile: "night-owl.css", name: "Night Owl"}
    ,{cssFile: "nnfx-dark.css", name: "nnfx Dark"}
    ,{cssFile: "nnfx.css", name: "nnfx"}
    ,{cssFile: "nord.css", name: "Nord"}
    ,{cssFile: "obsidian.css", name: "Obsidian"}
    ,{cssFile: "ocean.css", name: "Ocean"}
    ,{cssFile: "paraiso-dark.css", name: "Paraiso Dark"}
    ,{cssFile: "paraiso-light.css", name: "Paraiso Light"}
    ,{cssFile: "pojoaque.css", name: "Pojoaque"}
    ,{cssFile: "purebasic.css", name: "Pure Basic"}
    ,{cssFile: "qtcreator_dark.css", name: "Qt Creator Dark"}
    ,{cssFile: "qtcreator_light.css", name: "Qt Creator Light"}
    ,{cssFile: "railscasts.css", name: "Railscasts"}
    ,{cssFile: "rainbow.css", name: "Rainbow"}
    ,{cssFile: "routeros.css", name: "Routeros"}
    ,{cssFile: "school-book.css", name: "School Book"}
    ,{cssFile: "shades-of-purple.css", name: "Shades of Purple"}
    ,{cssFile: "solarized-dark.css", name: "Solarized Dark"}
    ,{cssFile: "solarized-light.css", name: "Solarized Light"}
    ,{cssFile: "srcery.css", name: "Srcery"}
    ,{cssFile: "sunburst.css", name: "Sunburst"}
    ,{cssFile: "tomorrow-night-blue.css", name: "Tomorrow Night Blue"}
    ,{cssFile: "tomorrow-night-bright.css", name: "Tomorrow Night Bright"}
    ,{cssFile: "tomorrow-night-eighties.css", name: "Tomorrow Night Eighties"}
    ,{cssFile: "tomorrow-night.css", name: "Tomorrow Night"}
    ,{cssFile: "tomorrow.css", name: "Tomorrow"}
    ,{cssFile: "vs.css", name: "VS"}
    ,{cssFile: "vs2015.css", name: "VS2015"}
    ,{cssFile: "xcode.css", name: "xcode"}
    ,{cssFile: "xt256.css", name: "xt256"}
    ,{cssFile: "zenburn.css", name: "Zenburn"}
  ];

  settingsMenu.smoothScrollOptions = ["Default", "Enabled", "Disabled"];

  var settingsMenuDiv = interfaceUtils.buildFloatingMenu('settingsMenu', 'Settings');
  settingsMenuDiv.parentNode.style.display = 'none';

  Array.from(document.getElementsByClassName('settingsButton'))
    .forEach((settingsButton) => {
      settingsButton.title = "Settings";
    
      settingsButton.onclick = function() {
        if (settingsMenuDiv.parentNode.style.display == 'block')
          settingsMenuDiv.parentNode.style.display = 'none';
        else
          settingsMenuDiv.parentNode.style.display = 'block';
      }
  });

  interfaceUtils.buildTabbedMenu(settingsMenuDiv, [
    {name: "Filters", content: settingsMenu.getFiltersContent(), select: true},
    {name: "CSS", content: settingsMenu.getCSSContent()},
    {name: "JS", content: settingsMenu.getJSContent()},
    {name: "Other", content: settingsMenu.getOtherContent()}
  ]);

  settingsMenu.nullSyntax = document.createElement('link');
  settingsMenu.nullSyntax.type = "text/css";
  settingsMenu.nullSyntax.rel = "stylesheet";
  settingsMenu.nullSyntax.id = "nullSyntax";

  settingsMenu.syntaxLink = document.createElement('link');
  settingsMenu.syntaxLink.type = "text/css";
  settingsMenu.syntaxLink.rel = "stylesheet";
  settingsMenu.syntaxLink.id = "syntaxLink";

  document.head.append(settingsMenu.nullSyntax);
  document.head.append(settingsMenu.syntaxLink);

  var syntaxTheme = JSON.parse(localStorage.getItem('syntaxTheme') || '0');
  var cssFile = settingsMenu.syntaxThemes[syntaxTheme].cssFile;
  if (cssFile) {
    settingsMenu.syntaxLink.href = "/.static/css/syntax/" + cssFile;
    settingsMenu.nullSyntax.href = "/.static/css/nullifySyntax.css";
  } else {
    settingsMenu.syntaxLink.href = "";
    settingsMenu.nullSyntax.href = "";
  }

  var smoothScroll = JSON.parse( localStorage.getItem('smoothScroll') || '0' );
  if ( (smoothScroll === 0 && api.mobile) || smoothScroll === 1 )
    document.body.parentNode.style.scrollBehavior = "smooth";
  else
    document.body.parentNode.style.scrollBehavior = null;

};

settingsMenu.addFilterDisplay = function(filter) {

  var filterCell = document.createElement('div');

  var cellWrapper = document.createElement('div');
  settingsMenu.existingFiltersDiv.appendChild(cellWrapper);

  var filterTypeLabel = document.createElement('span');
  filterTypeLabel.innerText = settingsMenu.filterTypes[filter.type];
  filterTypeLabel.className = 'existingFilterTypeLabel';
  filterCell.appendChild(filterTypeLabel);

  var filterContentLabel = document.createElement('span');
  var contentToDisplay = filter.filter;
  if (filter.regex) {
    contentToDisplay = '/' + contentToDisplay + '/';
  }
  filterContentLabel.textContent = contentToDisplay;
  filterContentLabel.className = 'existingFilterContentLabel';
  filterCell.appendChild(filterContentLabel);

  var button = document.createElement('span');
  button.className = 'removeButton glowOnHover coloredIcon';
  filterCell.appendChild(button);

  button.onclick = function() {

    settingsMenu.loadedFilters.splice(settingsMenu.loadedFilters
        .indexOf(filter), 1);

    localStorage.filterData = JSON.stringify(settingsMenu.loadedFilters);

    hiding.checkFilters();

    cellWrapper.remove();

  };

  cellWrapper.appendChild(document.createElement('hr'));
  cellWrapper.appendChild(filterCell);

};

settingsMenu.createFilter = function(content, regex, type) {

  if (type === 0 && content === "Anonymous") {
    alert("Cannot create name filter on '" + content + "'");
    return;
  }

  var newFilterData = {
    filter : content,
    regex : regex,
    type : type
  };

  settingsMenu.addFilterDisplay(newFilterData);

  settingsMenu.loadedFilters.push(newFilterData);

  localStorage
      .setItem('filterData', JSON.stringify(settingsMenu.loadedFilters));

  hiding.checkFilters();

};

settingsMenu.getFiltersContent = function() {

  var filtersPanel = document.createElement('div');
  filtersPanel.className = "panelContents";

  var newFilterPanel = document.createElement('form');
  newFilterPanel.id = 'newFilterPanel';
  newFilterPanel.className = 'formPanelContainer';

  filtersPanel.appendChild(newFilterPanel);

  var newFilterTypeCombo = document.createElement('select');

  for (var i = 0; i < 4; i++) {

    var option = document.createElement('option');
    option.innerText = settingsMenu.filterTypes[i];
    newFilterTypeCombo.appendChild(option);
  }

  newFilterPanel.appendChild(newFilterTypeCombo);

  var newFilterField = document.createElement('input');
  newFilterField.type = 'text';
  newFilterField.placeholder = 'filter';
  newFilterPanel.appendChild(newFilterField);

  var regexLabel = document.createElement('label');
  regexLabel.className = 'small';
  newFilterPanel.appendChild(regexLabel);

  var newFilterRegex = document.createElement('input');
  newFilterRegex.type = 'checkbox';
  regexLabel.appendChild(newFilterRegex);

  regexLabel.appendChild(document.createTextNode('Regex'));

  var newFilterButton = document.createElement('button');
  newFilterButton.innerText = 'Add filter';
  newFilterButton.onclick = function(e) {
    e.preventDefault();

    var filterContent = newFilterField.value.trim();

    if (!filterContent) {
      return;
    }

    settingsMenu.createFilter(filterContent, newFilterRegex.checked,
        newFilterTypeCombo.selectedIndex);
  };
  newFilterPanel.appendChild(newFilterButton);

  var existingFiltersLabelsPanel = document.createElement('div');
  filtersPanel.appendChild(existingFiltersLabelsPanel);

  var labelType = document.createElement('label');
  labelType.innerText = 'Type';
  labelType.id = 'labelExistingFilterType';
  existingFiltersLabelsPanel.appendChild(labelType);

  var labelContent = document.createElement('label');
  labelContent.innerText = 'Content';
  labelContent.id = 'labelExistingFilterContent';
  existingFiltersLabelsPanel.appendChild(labelContent);

  settingsMenu.existingFiltersDiv = document.createElement('div');
  settingsMenu.existingFiltersDiv.id = 'existingFiltersPanel';
  filtersPanel.appendChild(settingsMenu.existingFiltersDiv);

  for (var i = 0; i < settingsMenu.loadedFilters.length; i++) {
    settingsMenu.addFilterDisplay(settingsMenu.loadedFilters[i]);
  }

  return filtersPanel;

};

settingsMenu.getCSSContent = function() {

  var savedCSS = localStorage.customCSS;

  var head = document.getElementsByTagName('head')[0];

  var newCSS = document.createElement('style');

  head.appendChild(newCSS);

  if (savedCSS) {
    newCSS.innerText = savedCSS;
  }

  var cssPanel = document.createElement('div');
  cssPanel.className = "panelContents";

  var cssArea = document.createElement('textarea');
  cssPanel.appendChild(cssArea);
  if (savedCSS) {
    cssArea.value = savedCSS;
  }
  cssArea.id = 'cssInput';

  var bottomDiv = document.createElement('div');
  cssPanel.appendChild(bottomDiv);

  var saveButton = document.createElement('button');
  saveButton.innerText = 'Save';
  bottomDiv.appendChild(saveButton);

  saveButton.onclick = function() {
    newCSS.innerText = cssArea.value.trim();
    localStorage.customCSS = newCSS.innerText;
  };

  return cssPanel;

};

var makeCheckbox = function(parent, checked, text, storedName) {
  var div = document.createElement('div');

  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  var id = btoa(text);
  checkbox.id = "settings-" + id.substring(0, id.length - 2);
  checkbox.checked = checked;
  if (storedName)
    checkbox.checked = JSON.parse(localStorage[storedName] || 'false');

  var label = document.createElement('label');
  label.className = 'small';
  label.htmlFor = checkbox.id;
  label.innerText = text;

  div.append(checkbox);
  div.append(label);
  parent.append(div);
  return checkbox;
}

settingsMenu.getOtherContent = function() {

  var settingRelation = {
    'localTime' : 'Local Times',
    'relativeTime' : 'Relative Times',
    'hoveringImage' : 'Image Preview on Hover',
    'noAutoLoop' : 'Disable Autoloop',
    'noJsValidation' : 'Disable Proof of Work Solver',
    'noWs' : 'Disable WebSockets',
    'inlineReplies': 'Inline Replies',
    'bottomBacklinks': 'Bottom Replies',
    'noAutohideDeleted': 'Disable Autohiding Deleted Posts',
  };

  var otherPanel = document.createElement('div');
  otherPanel.className = "panelContents";

  for ( var key in settingRelation) {
    settingRelation[key] = makeCheckbox(otherPanel, false
      , settingRelation[key], key);
  }

  var videoVolumediv = document.createElement('div');
  otherPanel.appendChild(videoVolumediv);

  var videoVolumeLabel = document.createElement('label');
  videoVolumeLabel.className = 'small';
  videoVolumeLabel.innerText = 'Media Default Volume';

  var videoVolumeRange = document.createElement('input');
  videoVolumeRange.type = 'range';
  videoVolumeRange.min = '0';
  videoVolumeRange.max = '1';
  videoVolumeRange.step = '0.1';
  videoVolumeRange.value = JSON.parse(localStorage.videovol || 1);

  videoVolumediv.appendChild(videoVolumeLabel);
  videoVolumediv.appendChild(videoVolumeRange);
  videoVolumediv.appendChild(document.createElement("BR"));

  var syntaxThemeBox = document.createElement('select');
  syntaxThemeBox.id = "settings-syntax";
  settingsMenu.syntaxThemes.forEach((i) => {
    var themeOption = document.createElement('option');
    themeOption.innerText = i.name;
    syntaxThemeBox.append(themeOption);
  })

  var syntaxDiv = document.createElement('div');
  var syntaxLabel = document.createElement('label');
  syntaxLabel.htmlFor = "settings-syntax";
  syntaxLabel.className = "small labelBefore";
  syntaxLabel.innerText = "Syntax Highlighting Theme";

  syntaxDiv.append(syntaxLabel);
  syntaxDiv.append(syntaxThemeBox);
  otherPanel.append(syntaxDiv);
  syntaxDiv.append(document.createElement('br'));

  var smoothScrollBox = document.createElement('select');
  smoothScrollBox.id = "settings-smoothscroll";
  settingsMenu.smoothScrollOptions.forEach((val, i) => {
    var option = document.createElement('option');
    option.textContent = val;
    option.value = i;
    smoothScrollBox.append(option);
  })

  var smoothScrollDiv = document.createElement('div');
  var smoothScrollLabel = document.createElement('label');
  smoothScrollLabel.htmlFor = "settings-smoothscroll";
  smoothScrollLabel.className = "small labelBefore";
  smoothScrollLabel.innerText = "Smooth Scroll Behavior"

  smoothScrollDiv.append(smoothScrollLabel);
  smoothScrollDiv.append(smoothScrollBox);
  otherPanel.append(smoothScrollDiv);
  smoothScrollDiv.append(document.createElement('br'));

  var saveButton = document.createElement('button');
  otherPanel.appendChild(saveButton);
  saveButton.innerText = 'Save';

  saveButton.onclick = function() {

    var inlineChanged = (settingRelation['inlineReplies'].checked ^ localStorage['inlineReplies']) ||
      (settingRelation['bottomBacklinks'].checked ^ localStorage['bottomBacklinks'])

      for ( var key in settingRelation) {
        localStorage.setItem(key, settingRelation[key].checked);
      }

    if (settingRelation['hoveringImage'].checked)
      thumbs.addHoveringExpand();
    else
      thumbs.removeHoveringExpand();
    thread.changeRefresh();

    localStorage.setItem('videovol', videoVolumeRange.value);

    localStorage.setItem('syntaxTheme', syntaxThemeBox.selectedIndex);
    var cssFile = settingsMenu.syntaxThemes[syntaxThemeBox.selectedIndex].cssFile;
    settingsMenu.syntaxLink.href = cssFile ? "/.static/css/syntax/" + cssFile : '';
    settingsMenu.nullSyntax.href = cssFile ? "/.static/css/nullifySyntax.css" : '';

    localStorage.setItem('smoothScroll', smoothScrollBox.selectedIndex);
    console.log(smoothScrollBox.selectedIndex);
    if ( (smoothScrollBox.selectedIndex === 0 && api.mobile) 
         || smoothScrollBox.selectedIndex === 1 ) {
      document.body.parentNode.style.scrollBehavior = "smooth";
    } else {
      document.body.parentNode.style.scrollBehavior = null;
    }

    if (inlineChanged) {
      location.reload()
    }

  }

  return otherPanel;

};

settingsMenu.getJSContent = function() {

  var savedJS = localStorage.customJS;

  if (savedJS) {
    var newJS = document.createElement('script');
    newJS.text = savedJS;
    document.body.appendChild(newJS);
  }

  var jsPanel = document.createElement('div');
  jsPanel.className = "panelContents";

  var jsArea = document.createElement('textarea');
  jsPanel.appendChild(jsArea);
  if (savedJS) {
    jsArea.value = savedJS;
  }
  jsArea.id = 'jsInput';

  var bottomDiv = document.createElement('div');
  jsPanel.appendChild(bottomDiv);

  var saveButton = document.createElement('button');
  saveButton.innerText = 'Save';
  bottomDiv.appendChild(saveButton);

  saveButton.onclick = function() {
    localStorage.customJS = jsArea.value.trim();
  };

  return jsPanel;

};

settingsMenu.init();
