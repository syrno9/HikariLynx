var trashBin = {};

trashBin.restoreContent = function() {

  var params = {
    action : 'restore'
  };

  postCommon.newGetSelectedContent(params);

  api.formApiRequest('contentActions', params, function reported(status, data) {

    if (status === 'ok') {
      location.reload(true);
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

};

trashBin.init = function() {

  api.convertButton('restoreFormButton', trashBin.restoreContent);

};

trashBin.init();
