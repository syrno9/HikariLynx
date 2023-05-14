var validationWorker = {};

onmessage = function(message) {

  message = message.data;

  switch (message.type) {

  case 'start': {
    validationWorker.start(message);
    break;
  }

  case 'stop': {
    validationWorker.running = false;
    break;
  }

  }

}

validationWorker.coreCount = navigator.hardwareConcurrency;

validationWorker.start = async function(message) {

  validationWorker.running = true;

  var textEncoder = new TextEncoder("utf-8");

  var passwordBuffer = textEncoder.encode(message.session);

  var importedKey = await
  crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false,
      [ "deriveBits" ]);

  var code = message.code;

  var params = {
    name : "PBKDF2",
    hash : "SHA-512",
    iterations : 16384
  };

  while (validationWorker.running) {

    params.salt = textEncoder.encode(code);

    if (message.hash === btoa(String.fromCharCode(...new Uint8Array(
        await crypto.subtle.deriveBits(params, importedKey, 256 * 8))))) {

      postMessage(code);
    }

    code += validationWorker.coreCount;

  }

};