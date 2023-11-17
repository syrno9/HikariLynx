    document.getElementById('newsButton').addEventListener('click', function() {
        var newsMobile = document.querySelector('.newsMobile');
        var faqMobile = document.querySelector('.faqMobile');
        var rulesMobile = document.querySelector('.rulesMobile');
        var friendsMobile = document.querySelector('.friendsMobile');
        var chatsMobile = document.querySelector('.chatsMobile');

        if (newsMobile && faqMobile && rulesMobile && friendsMobile && chatsMobile) {
            newsMobile.style.visibility = 'visible';
            newsMobile.style.display = 'block';
            faqMobile.style.visibility = 'hidden';
            faqMobile.style.display = 'none';
            rulesMobile.style.visibility = 'hidden';
            rulesMobile.style.display = 'none';
            friendsMobile.style.visibility = 'hidden';
            friendsMobile.style.display = 'none';
            chatsMobile.style.visibility = 'hidden';
            chatsMobile.style.display = 'none';
        } else {
            console.error('One or more elements not found!');
        }
    });

    document.getElementById('faqButton').addEventListener('click', function() {
        var faqMobile = document.querySelector('.faqMobile');
        var newsMobile = document.querySelector('.newsMobile');
        var rulesMobile = document.querySelector('.rulesMobile');
        var friendsMobile = document.querySelector('.friendsMobile');
        var chatsMobile = document.querySelector('.chatsMobile');

        if (faqMobile && newsMobile && rulesMobile && friendsMobile && chatsMobile) {
            faqMobile.style.visibility = 'visible';
            faqMobile.style.display = 'block';
            newsMobile.style.visibility = 'hidden';
            newsMobile.style.display = 'none';
            rulesMobile.style.visibility = 'hidden';
            rulesMobile.style.display = 'none';
            friendsMobile.style.visibility = 'hidden';
            friendsMobile.style.display = 'none';
            chatsMobile.style.visibility = 'hidden';
            chatsMobile.style.display = 'none';
        } else {
            console.error('One or more elements not found!');
        }
    });

    document.getElementById('rulesButton').addEventListener('click', function() {
        var rulesMobile = document.querySelector('.rulesMobile');
        var friendsMobile = document.querySelector('.friendsMobile');
        var chatsMobile = document.querySelector('.chatsMobile');
        var newsMobile = document.querySelector('.newsMobile');
        var faqMobile = document.querySelector('.faqMobile');

        if (rulesMobile && friendsMobile && chatsMobile && newsMobile && faqMobile) {
            rulesMobile.style.visibility = 'visible';
            rulesMobile.style.display = 'block';
            friendsMobile.style.visibility = 'hidden';
            friendsMobile.style.display = 'none';
            chatsMobile.style.visibility = 'hidden';
            chatsMobile.style.display = 'none';
            newsMobile.style.visibility = 'hidden';
            newsMobile.style.display = 'none';
            faqMobile.style.visibility = 'hidden';
            faqMobile.style.display = 'none';
        } else {
            console.error('One or more elements not found!');
        }
    });
	
    document.getElementById('friendsButton').addEventListener('click', function() {
        var friendsMobile = document.querySelector('.friendsMobile');
        var rulesMobile = document.querySelector('.rulesMobile');
        var chatsMobile = document.querySelector('.chatsMobile');
        var newsMobile = document.querySelector('.newsMobile');
        var faqMobile = document.querySelector('.faqMobile');

        if (friendsMobile && rulesMobile && chatsMobile && newsMobile && faqMobile) {
            friendsMobile.style.visibility = 'visible';
            friendsMobile.style.display = 'block';
            rulesMobile.style.visibility = 'hidden';
            rulesMobile.style.display = 'none';
            chatsMobile.style.visibility = 'hidden';
            chatsMobile.style.display = 'none';
            newsMobile.style.visibility = 'hidden';
            newsMobile.style.display = 'none';
            faqMobile.style.visibility = 'hidden';
            faqMobile.style.display = 'none';
        } else {
            console.error('One or more elements not found!');
        }
    });

    document.getElementById('chatsButton').addEventListener('click', function() {
        var chatsMobile = document.querySelector('.chatsMobile');
        var rulesMobile = document.querySelector('.rulesMobile');
        var friendsMobile = document.querySelector('.friendsMobile');
        var newsMobile = document.querySelector('.newsMobile');
        var faqMobile = document.querySelector('.faqMobile');

        if (chatsMobile && rulesMobile && friendsMobile && newsMobile && faqMobile) {
            chatsMobile.style.visibility = 'visible';
            chatsMobile.style.display = 'block';
            rulesMobile.style.visibility = 'hidden';
            rulesMobile.style.display = 'none';
            friendsMobile.style.visibility = 'hidden';
            friendsMobile.style.display = 'none';
            newsMobile.style.visibility = 'hidden';
            newsMobile.style.display = 'none';
            faqMobile.style.visibility = 'hidden';
            faqMobile.style.display = 'none';
        } else {
            console.error('One or more elements not found!');
        }
    });
	
document.getElementById('mainContainer').style.display = 'block';
document.getElementById('mobileContainer').style.display = 'block';