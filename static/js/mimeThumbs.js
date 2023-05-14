var mimeThumbs = {};

mimeThumbs.processCell = function(cell) {

  api.convertButton(cell.getElementsByClassName('deleteFormButton')[0],
      function() {

        api.formApiRequest('deleteMimeThumb', {
          thumbId : cell.getElementsByClassName('idIdentifier')[0].value,
        }, function requestComplete(status, data) {

          if (status === 'ok') {
            cell.remove();
          } else {
            alert(status + ': ' + JSON.stringify(data));
          }
        });

      });

};

mimeThumbs.showNewThumb = function(mime, data) {

  var cell = document.createElement('form');

  cell.className = 'mimeThumbCell';
  cell.method = 'post';
  cell.enctype = 'multipart/form-data';
  cell.action = '/deleteMimeThumb.js';

  var label = document.createElement('label');
  label.appendChild(document.createTextNode('Mime: '));

  var mimeLabel = document.createElement('span');
  mimeLabel.textContent = mime;
  mimeLabel.className = 'mimeLabel';

  label.appendChild(mimeLabel);

  cell.appendChild(label);

  var image = document.createElement('img');
  image.className = 'thumbImg';
  image.src = '/.global/mimeThumbs/' + data;

  cell.appendChild(image);

  cell.appendChild(document.createElement('br'));

  var input = document.createElement('input');

  input.value = data;
  input.type = 'hidden';
  input.className = 'idIdentifier';
  input.name = 'thumbId';
  cell.appendChild(input);

  var deleteButton = document.createElement('button');
  deleteButton.className = 'deleteFormButton';
  deleteButton.type = 'submit';
  deleteButton.textContent = 'Delete';

  cell.appendChild(deleteButton);

  cell.appendChild(document.createElement('hr'));

  document.getElementById('thumbList').appendChild(cell);

  mimeThumbs.processCell(cell);
};

mimeThumbs.addThumb = function() {

  var typedMime = document.getElementById('fieldMime').value.trim();

  if (!typedMime) {
    return alert('You must provide a mimetype.');
  }

  var filePicker = document.getElementById('files');

  if (!filePicker.files.length) {
    return alert('You must select a file.');
  }

  api.formApiRequest('createMimeThumb', {
    files : [ {
      content : filePicker.files[0]
    } ],
    mime : typedMime,
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      document.getElementById('fieldMime').value = '';

      filePicker.type = 'text';
      filePicker.type = 'file';

      mimeThumbs.showNewThumb(typedMime, data);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

mimeThumbs.init = function() {

  api.convertButton('addFormButton', mimeThumbs.addThumb);

  var thumbCells = document.getElementsByClassName('mimeThumbCell');

  for (var i = 0; i < thumbCells.length; i++) {
    mimeThumbs.processCell(thumbCells[i]);
  }

};

mimeThumbs.init();
