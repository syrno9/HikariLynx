document.getElementById('overrideButton').addEventListener('click', function() {
    var sidebar = document.querySelector('.sidebar-wrapper-ontop');
    var content = document.querySelector('.content-wrapper');
    var navHeader = document.querySelector('nav.navHeader');

    if (sidebar && content && navHeader) {
        sidebar.style.visibility = 'hidden';
        content.style.marginLeft = '0';
        navHeader.style.left = '0';
        
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

    if (sidebar && content && navHeader) {
        sidebar.style.visibility = 'visible';
        content.style.marginLeft = '225px';
        navHeader.style.left = '225px';

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
        
        if (sidebar && content && navHeader) {
            sidebar.style.visibility = 'hidden';
            content.style.marginLeft = '0';
            navHeader.style.left = '0';
        } else {
            console.error('One or more elements not found!');
        }
    }
});
