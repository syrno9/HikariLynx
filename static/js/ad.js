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
        '/.static/pages/rules.html',
        '/.static/pages/rules.html',
        '/.static/pages/irc.html'
    ];

    const imageUrls = [
        '/.static/house_ads/Hikari_Aca.png',
        '/.static/house_ads/Hikari_Aca2.gif',
        '/.static/house_ads/Hikari_En.gif',
        '/.static/house_ads/Hikari_V.png',
        '/.static/house_ads/Hikari_V2.gif',
        '/.static/house_ads/Hikari_Jp.png',
        '/.static/house_ads/Hikari_T.png',
        '/.static/house_ads/Hikari_T2.png',
        '/.static/house_ads/Hikari_T3.png',
        '/.static/house_ads/Hikari_H3.png',
        '/.static/house_ads/Hikari_Rules.png',
        '/.static/house_ads/Hikari_Rules2.png',
        '/.static/house_ads/Hikari_Irc.png'
    ];

    const randomIndex = Math.floor(Math.random() * haUrls.length);

    haContainer.href = haUrls[randomIndex];
    haImage.src = imageUrls[randomIndex];
});
