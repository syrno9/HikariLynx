var captchaUtils = {};

captchaUtils.init = function() {

  var reloadButtons = document.getElementsByClassName('reloadCaptchaButton');

  Array.from(reloadButtons).forEach((reloadButton) => {
    reloadButton.style.display = "inline-block";
    reloadButton.onclick = function() { captchaUtils.reloadCaptcha() };
  });

  captchaUtils.updateFunction();

  document.addEventListener('keydown', function (e) {
	if (e.key === 'r' && e.altKey)
	  captchaUtils.reloadCaptcha()
  })

  var captchaImages = document.getElementsByClassName('captchaImage');
  var firstImage = captchaImages[0];
  if (firstImage !== undefined) {
    firstImage.onerror = (e) => captchaUtils.warnCaptchaError(e);
  }
};

captchaUtils.captchaTimers = document.getElementsByClassName('captchaTimer');

captchaUtils.reloadCaptcha = function() {

  document.cookie = 'captchaid=; path=/;';

  var captchaImages = Array.from(document.getElementsByClassName('captchaImage'));
  captchaImages.forEach((image) => {
    image.src = '/captcha.js?d=' + new Date().toString();
  })

  var captchaFields = document.getElementsByClassName('captchaField');

  for (var i = 0; i < captchaFields.length; i++) {
    captchaFields[i].value = '';
  }

};

captchaUtils.updateFunction = function updateElements() {

  var cookies = api.getCookies();

  if (!cookies.captchaexpiration) {
    setTimeout(captchaUtils.updateFunction, 1000);
    return;
  }

  var captchaExpiration = new Date(cookies.captchaexpiration);

  var delta = captchaExpiration.getTime() - new Date().getTime();

  var time = '';

  if (delta > 1000) {
    time = Math.floor(delta / 1000);

    captchaUtils.reloading = false;

  } else {

    time = 'Reloading';

    if (!captchaUtils.reloading) {

      captchaUtils.reloading = true;

      captchaUtils.reloadCaptcha();

    }
  }

  for (var i = 0; i < captchaUtils.captchaTimers.length; i++) {
    captchaUtils.captchaTimers[i].innerText = time;
  }

  setTimeout(captchaUtils.updateFunction, 1000);

};

captchaUtils.init();

function testReload() {

  captchaUtils.reloadCaptcha();

};

captchaUtils.warnCaptchaError = function(e) {
  alert("Could not reload CAPTCHA at this time.\n" +
        "Please wait a few seconds before attempting to reload again.");
}
