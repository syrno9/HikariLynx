var bypass = {};

bypass.init = function() {

  if (!crypto.subtle || JSON.parse(localStorage.noJsValidation || 'false')) {
    return;
  }

  api.convertButton('bypassFormButton', bypass.blockBypass, 'bypassField');

  bypass.creationButton = document.getElementById('bypassFormButton');
  bypass.originalCreationText = bypass.creationButton.innerText;

  bypass.validationButton = document.getElementById("validationButton");
  if (!bypass.validationButton) {
    return;
  }

  document.getElementById('noJs').remove();

  bypass.originalText = bypass.validationButton.innerText;

  bypass.validationButton.className = "";

  var callback = function(status, data) {

    if (status === 'ok') {
      document.getElementById("indicatorNotValidated").remove();
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  };

  callback.stop = function() {
    bypass.validationButton.innerText = bypass.originalText;
  };

  bypass.validationButton.onclick = function() {

    bypass.validationButton.innerText = "Please wait for validation";

    bypassUtils.runValidation(callback);

    return false;

  };

};

bypass.addIndicator = function() {

  if (document.getElementById('indicatorValidBypass')) {

    if (document.getElementById("indicatorNotValidated")) {
      document.getElementById("indicatorNotValidated").remove();
    }

    return;
  }

  var paragraph = document.getElementById('settingsFieldset');

  var div = document.createElement('div');
  div.innerText = 'You have a valid block bypass.';
  div.id = 'indicatorValidBypass';
  paragraph.insertBefore(div, paragraph.children[2]);

};

bypass.blockBypass = function() {

  var captchaField = document.getElementById('fieldCaptcha');

  var typedCaptcha = captchaField.value.trim();

  if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
    alert('Captchas are exactly 6 (112 if no cookies) characters long.');
    return;
  }

  api.formApiRequest('renewBypass', {
    captcha : typedCaptcha
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      captchaUtils.reloadCaptcha();

      captchaField.value = '';

      if (api.getCookies().bypass.length <= 372) {

        bypass.addIndicator();
        return;

      }

      var callback = function(status, data) {

        if (status === 'ok') {
          bypass.addIndicator();
        } else {
          alert(status + ': ' + JSON.stringify(data));
        }

      };

      callback.stop = function() {
        bypass.creationButton.innerText = bypass.originalCreationText;
      };

      bypass.creationButton.innerText = "Please wait for validation";

      bypassUtils.runValidation(callback);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

bypass.init();
