document.addEventListener('DOMContentLoaded', function() {
    const haContainer = document.getElementById('haContainer');
    haContainer.style.display = 'block !important';
    const haImage = document.getElementById('haImage');

    const haUrls = [
        '/aca/',
        '/aca/',
        '/en/',
        '/v/',
        '/v/',
        '/jp/',
        '/t/',
        '/t/',
        '/t/',
        '/h3/',
        '/rules',
        '/rules',
        '/irc',
        '/i/',
        '/',
        '/f/'
    ];

    const imageUrls = [
        '/.static/banners/Hikari_Aca.png',
        '/.static/banners/Hikari_Aca2.gif',
        '/.static/banners/Hikari_En.gif',
        '/.static/banners/Hikari_V.png',
        '/.static/banners/Hikari_V2.gif',
        '/.static/banners/Hikari_Jp.png',
        '/.static/banners/Hikari_T.png',
        '/.static/banners/Hikari_T2.png',
        '/.static/banners/Hikari_T3.png',
        '/.static/banners/Hikari_H3.png',
        '/.static/banners/Hikari_Rules.png',
        '/.static/banners/Hikari_Rules2.png',
        '/.static/banners/Hikari_Irc.png',
        '/.static/banners/Hikari_I.png',
        '/.static/banners/Hikari_Home.gif',
        '/.static/banners/Hikari_F.png'
    ];

    const randomIndex = Math.floor(Math.random() * haUrls.length);

    haContainer.href = haUrls[randomIndex];
    haImage.src = imageUrls[randomIndex];
});

    var bannerImage = document.getElementById('bannerImage');

    bannerImage.addEventListener('click', function() {
      var currentSrc = bannerImage.src;

      var newSrc = currentSrc + '?timestamp=' + new Date().getTime();

      bannerImage.src = newSrc;
    });