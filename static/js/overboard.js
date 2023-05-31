var board = true;

document.addEventListener("DOMContentLoaded", function(event) {
  var cells = document.getElementsByClassName("opCell");
  for(var i=0; i<cells.length; i++) {
    var cell = cells[i]
    var elem = document.createElement('p')
    elem.innerHTML = '<a href="/'+cell.dataset.boarduri+'/">&gt;&gt;&gt;/'+cell.dataset.boarduri+'/</a>'
    cell.insertBefore(elem, cell.childNodes[1])
  }
})
