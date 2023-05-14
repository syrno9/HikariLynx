function Draw() {
  return new Promise((resolve, reject) => {
    //margin:70px auto 20px auto;
    var headElem=document.querySelector('head')
    var styles=[
      'lib/wColorPicker.min.css',
      'wPaint.min.css',
    ]
    var scripts=[
      'lib/jquery-3.6.0.min.js',
      'lib/jquery-ui.min.js',
      'lib/wColorPicker.min.js',
      'wPaint.min.js',
      'plugins/main/src/fillArea.min.js',
      'plugins/main/src/wPaint.menu.main.js',
      'plugins/text/src/wPaint.menu.text.js',
      'plugins/shapes/src/shapes.min.js',
      'plugins/shapes/src/wPaint.menu.main.shapes.js',
    ];
    var allStylesLoaded=false
    var scriptsDone=0
    function loadScript(index) {
      if (index===undefined) index=0

      var scriptElem=document.createElement('script')
      scriptElem.onload=function() {
        scriptsDone++
        if (scriptsDone==scripts.length) {
          oekaki.allScriptsLoaded=true
          phase2()
          resolve()
        } else {
          index++;
          loadScript(index)
        }
      }
      scriptElem.src='../../.static/js/wPaint/'+scripts[index]
      headElem.appendChild(scriptElem)

    }
    loadScript()
    var stylesDone=0
    for(var i in styles) {
      var linkElem=document.createElement('link')
      linkElem.type='text/css'
      linkElem.rel='stylesheet'
      linkElem.href='../../.static/images/wPaint/'+styles[i]
      headElem.appendChild(linkElem)
    }

    var paintElem=document.getElementById('wPaint')
    paintElem.style.width=parseInt(document.getElementById('oekakiWidth').value)+'px'
    paintElem.style.height=parseInt(document.getElementById('oekakiHeight').value)+'px'
    paintElem.style.marginTop='50px'
    //paintElem.style.backgroundColor='#fff'
    paintElem.style.border="1px solid"
    var oekakiA = {}
    oekakiA.load_img = function() {
      alert(_("Click on any image on this site to load it into oekaki applet"))
      $('img').one('click.loadimg', function(e) {
        $('img').off('click.loadimg')
        e.stopImmediatePropagation()
        e.preventDefault()
        var url = $(this).prop('src')
        $('#wPaint').wPaint('setBg', url)
        return false
      })
    }

    function phase2() {
      // legacy! will break other scripts using https://api.jquery.com/load/
      $.fn.load = function() {
        this.on('load', ...arguments)
      }

      $.extend($.fn.wPaint.defaults, {
        mode:        'pencil',  // set mode
        lineWidth:   '1',       // starting line width
        fillStyle:   '#FFFFFF', // starting fill style
        strokeStyle: '#000000',  // start stroke style
      })
      delete $.fn.wPaint.menus.main.items.save

      // init wPaint
      $('#wPaint').wPaint({
        //path: configRoot+'js/wPaint/',
        menuOffsetLeft: -35,
        menuOffsetTop: -50,
        //saveImg: saveImg,
        loadImgBg: oekakiA.load_img,
        loadImgFg: oekakiA.load_img
      })

      //$('.wColorPicker-palette-simple').remove();

      $('.wPaint-menu-colorpicker').wColorPicker({
        theme           : 'classic',  // set theme
        opacity         : 0.8,        // opacity level
        color           : '#FF0000',  // set init color
        mode            : 'flat',     // mode for palette (flat, hover, click)
        position        : 'bl',       // position of palette, (tl, tc, tr, rt, rm, rb, br, bc, bl, lb, lm, lt)
        generateButton  : true,       // if mode not flat generate button or not
        dropperButton   : false,      // optional dropper button to use in other apps
        effect          : 'slide',    // only used when not in flat mode (none, slide, fade)
        showSpeed       : 500,        // show speed for effects
        hideSpeed       : 500,        // hide speed for effects
        onMouseover     : null,       // callback for color mouseover
        onMouseout      : null,       // callback for color mouseout
        onSelect        : null,       // callback for color when selected
        onDropper       : null        // callback when dropper is clicked
      });
    }
  })
}

var oekaki = {}

oekaki.allScriptsLoaded = false;

oekaki.expanded = false;

oekaki.loadImage = function(event) {
  if (event) {
    Object.assign(new Image(), {
      src: event.target.href,
      onload() {
        const wPaint = $.data($('#wPaint')[0], 'wPaint')
        wPaint.ctxBgResize = true
        wPaint.ctxResize = true
        $("#wPaint").css({
          width: this.width + 'px',
          height: this.height + 'px'
        }).wPaint('resize').wPaint('image', this.src)
      }
    })
  }
  else {
    $("#wPaint").css({
      width: parseInt(document.getElementById('oekakiWidth').value) + 'px',
      height: parseInt(document.getElementById('oekakiHeight').value) + 'px'
    }).wPaint('resize')
  }
}

function showOekaki(event) {
  var paintElem = document.getElementById('wPaint');
  if ((oekaki.expanded == false) || event) {

    if(oekaki.allScriptsLoaded != true) {
      Draw().then(() => {
        oekaki.loadImage(event)
      }).catch(console.error);
    } else {
      paintElem.style.display='';
      oekaki.loadImage(event)
    }
    paintElem && paintElem.scrollIntoView();
    oekaki.expanded = true;

  } else {
    $('#wPaint').wPaint('clear');
    paintElem.style.display='none';
    oekaki.expanded = false;
  }

}

var oekakiButton = document.getElementById('oekakiButton');

if (oekakiButton) {
  oekakiButton.onclick = () => showOekaki();
}

oekaki.dataURLtoBlob = function(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}
