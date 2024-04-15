document.getElementById('mainContainer').style.display = 'block';
document.getElementById('toggle').style.visibility = 'visible';

    var toggleCheckbox = document.getElementById('toggle');

    var homePosts = document.querySelector('.homePosts');

    toggleCheckbox.addEventListener('change', function() {

      homePosts.style.overflowY = toggleCheckbox.checked ? 'scroll' : 'hidden';
    });