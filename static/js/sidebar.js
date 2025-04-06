document.getElementById('overrideButton').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar-wrapper-ontop');
    var content = document.querySelector('.content-wrapper');
    var navHeader = document.querySelector('nav.navHeader');
    var headerSide = document.querySelector('.headerLinks');
    var butt = document.querySelector('.sideButt');

    if (sidebar && content && navHeader) {
        sidebar.style.width = '0px';
        navHeader.style.left = '0';
		headerSide.style.right= '13px';
        butt.style.visibility = 'visible';
        
        // Store state in local storage
        localStorage.setItem('sidebarState', 'hidden');
    } else {
        console.error('One or more elements not found!');
    }
});

document.getElementById('applyCustomCSS').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar-wrapper-ontop');
    var content = document.querySelector('.content-wrapper');
    var navHeader = document.querySelector('nav.navHeader');
    var headerSide = document.querySelector('.headerLinks');
    var butt = document.querySelector('.sideButt');

    if (sidebar && content && navHeader) {
        sidebar.style.width = '200px';
        navHeader.style.left = '225px';
		headerSide.style.right= '133px';
		butt.style.visibility = 'hidden';

        // Store state in local storage
        localStorage.setItem('sidebarState', 'visible');
    } else {
        console.error('One or more elements not found!');
    }
});

// Check local storage for the state and apply it on page load
document.addEventListener('DOMContentLoaded', function() {
    var storedState = localStorage.getItem('sidebarState');
    if (storedState === 'hidden') {
        var sidebar = document.querySelector('.sidebar-wrapper-ontop');
        var content = document.querySelector('.content-wrapper');
        var navHeader = document.querySelector('nav.navHeader');
		var headerSide = document.querySelector('.headerLinks');
		var butt = document.querySelector('.sideButt');

        if (sidebar && content && navHeader) {
            sidebar.style.visibility = 'hidden';
            content.style.marginLeft = '0';
            navHeader.style.left = '0';
			headerSide.style.right= '13px';
			butt.style.visibility = 'visible';
        } else {
            console.error('One or more elements not found!');
        }
    }
});
