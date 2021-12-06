var filters = {},
    defaults = {
      Brightness: [0, 200, 100],
      Contrast: [0, 200, 100],
      Grayscale: [0, 100, 0],
      HueRotate: [0, 360, 0],
      Invert: [0, 100, 0],
      Saturate: [0, 200, 100],
      Sepia: [0, 100, 0]
    },
    constructed = {},
    target;
const sliderControl = document.getElementById('sliderControl');

const addEffectBtn = document.getElementById('addEffectBtn');

addEffectBtn.addEventListener('click', () => {
  addEffectBtn.classList.toggle('open');
});

var resizeEvt;
const main = document.getElementById('main'),
      canvas = document.getElementById('imgcanv');

window.addEventListener('load', resizeCanv(), false);

function resizeCanv() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 150;
}

window.addEventListener("resize", function() {
  clearTimeout(resizeEvt);
  resizeEvt = setTimeout(function() {
    if(main.classList.contains('hasimg')) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 150;

      constructFilters();
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 150;
    }
  }, 250);
});

const fileControl = document.getElementById('uploadBtn');

fileControl.addEventListener('change', loadImg);

var file, fr, img;

function loadImg() {
  if(typeof window.FileReader !== 'function') {
    alert('FILTERR is not supported by your browser!');
    return false;
  }

  if(!fileControl) {
    alert('No file!');
  } else if(!fileControl.files) {
    alert('Browser does not support "files" property of file inputs.');
  } else if(!fileControl.files[0]) {
    alert('Please select a file first!');
  } else {
    resetAll();
    file = fileControl.files[0];
    fr = new FileReader();
    fr.onload = createImg;
    fr.readAsDataURL(file);
  }

  function createImg() {
    img = new Image();
    img.onload = imgLoaded;
    img.src = fr.result;
  }
}

function imgLoaded() {
  const context = canvas.getContext('2d'),
        imgWidth = img.naturalWidth,
        imgHeight = img.naturalHeight,
        canvWidth = canvas.width,
        canvHeight = canvas.height;

  context.imageSmoothingEnabled = true;
  context.filter = 'none';
  destroyFilters();

  if(imgWidth > imgHeight) {
    var newHeight = imgWidth / canvWidth * 100;

    if(newHeight <= 100) {
      main.classList.add('hasimg');
      initControls();
      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (imgWidth - 40) / 2,
        canvHeight / 2 - (imgHeight - 40) / 2,
        imgWidth - 40, imgHeight - 40);
    } else {
      var factor = newHeight / 100,
          drawHeight = imgHeight / factor;

      main.classList.add('hasimg');
      initControls();
      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (canvWidth - 40) / 2,
        canvHeight / 2 - (drawHeight - 40) / 2,
        canvWidth - 40, drawHeight - 40);
    };
  } else if(imgHeight >= imgWidth) {
    var newWidth = imgHeight / canvHeight * 100;

    if(newWidth <= 100) {
      main.classList.add('hasimg');
      initControls();
      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (imgWidth - 40) / 2,
        canvHeight / 2 - (imgHeight - 40) / 2,
        imgWidth - 40, imgHeight - 40);
    } else {
      var factor = newWidth / 100,
          drawWidth = imgWidth / factor;

      main.classList.add('hasimg');
      initControls();
      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (drawWidth - 40) / 2,
        canvHeight / 2 - (canvHeight - 40) / 2,
        drawWidth - 40, canvHeight - 40);
    };
  };
};

const controlsDiv = document.getElementById('controlsInit');

function initControls() {
  controlsDiv.classList.remove('init');
};

const filterChoices = document.querySelectorAll('.filterChoice');

filterChoices.forEach(choice => {
  choice.addEventListener('click', function() {
    addEffectBtn.classList.remove('open');
    controlsDiv.classList.remove('empty');
    createIcon(choice);
  }, false);
});

const filterIconList = document.getElementById('filterList');

function createIcon(choice) {
  const filterChoice = choice.innerHTML,
        filterIcons = document.querySelectorAll('.filterIcon'),
        newFilterEl = document.createElement('li'),
        newFilterElClass = newFilterEl.classList.add('filterIcon'),
        newFilterElSubClass = newFilterEl.classList.add('filterIcon--' + filterChoice),
        newFilterElLabel = newFilterEl.setAttribute('data-filter', filterChoice),
        filterIconUniqID = 'a' + Date.now(),
        newFilterUniqID = newFilterEl.setAttribute('id', filterIconUniqID);

  target = newFilterEl.getAttribute('id');

  filters[target] = new Array();

  filters[target].push(filterChoice);
  filters[target].push(defaults[filterChoice][2]);

  filterIconList.appendChild(newFilterEl);

  let fallbackTarget = document.getElementById(target);

  setCurrent(filterChoice, null, fallbackTarget);

  newFilterEl.addEventListener('click', function(e) {
    setCurrent(filterChoice, e);
  }, false);
};

const sliderToggle = document.getElementById("sliderToggle"),
      removeBtn = document.getElementById('removeBtn'),
      doneBtn = document.getElementById('doneBtn');

function setCurrent(current, e, fallbackID) {
  if(e === null) {
    const currentTarget = fallbackID;
    target = currentTarget.getAttribute('id');
  } else {
    const currentTarget = e.target;
    target = currentTarget.getAttribute('id');
  };

  const currentFilter = filters[target][0],
        filterValue = filters[target][1];

  sliderControl.setAttribute('min', defaults[current][0]);
  sliderControl.setAttribute('max', defaults[current][1]);
  

  sliderControl.value = filterValue;
  updateBubble(filterValue);
  updateIndicator(currentFilter, true);
  sliderToggle.classList.add('slider');
};

function updateIndicator(filterName, isShow) {
  const filterIndicator = document.getElementById('filterIndicator');

  if(isShow) {
    filterIndicator.classList.add('show');
  } else {
    filterIndicator.classList.remove('show');
  };

  filterIndicator.innerHTML = filterName;
};

sliderControl.addEventListener('change', (e) => sliderControlChange(e), false);
sliderControl.addEventListener('input', (e) => sliderControlChange(e), false);

function sliderControlChange(e) {
  updateBubble(e.target.value);
  const currentValue = e.target.value;
  
  filters[target][1] = currentValue;
  constructFilters();
};

const sliderIndicator = document.getElementById('sliderIndicator');

function updateBubble(sliderValue) {
  if(filters[target][0] == 'HueRotate') {
    const indicatorUnit = 'deg';
    sliderIndicator.innerHTML = sliderValue + indicatorUnit;
  } else {
    const indicatorUnit = '%';
    sliderIndicator.innerHTML = sliderValue + indicatorUnit;
  };
};

removeBtn.addEventListener('click', function() {
  const numOfIcons = document.querySelectorAll('.filterIcon'),
        iconTarget = document.getElementById(target);

  updateIndicator('', false);

  delete filters[target];

  if(numOfIcons.length >=2) {
    sliderToggle.classList.remove('slider');
    iconTarget.remove();
    constructFilters();
  } else {
    sliderToggle.classList.remove('slider');
    iconTarget.remove();
    controlsDiv.classList.add('empty');
    constructFilters();
  };
});

doneBtn.addEventListener('click', function() {
  updateIndicator('', false);
  sliderToggle.classList.remove('slider');
});

function constructFilters() {
  if(Object.keys(filters).length > 0) {
    for(var key in filters) {
      const filterName = filters[key][0],
            filterValue = filters[key][1],
            unit = '%';

      if(filterName === 'HueRotate') {
        constructed[target] = 'Hue-Rotate(' + filterValue +  'deg)';
        applyFilters();
      } else {
        constructed[target] = filterName + '(' + filterValue + unit + ')';
        applyFilters();
      };
    }
  } else {
    constructed = {};
    applyFilters();
  };
};

function applyFilters() {
  const filterStringValues = Object.values(constructed),
        filterString = filterStringValues.join(' ');

  redrawImage(filterString);
};

function redrawImage(contextFilter) {
  const context = canvas.getContext('2d'),
        imgWidth = img.naturalWidth,
        imgHeight = img.naturalHeight,
        canvWidth = canvas.width,
        canvHeight = canvas.height;

  context.imageSmoothingEnabled = true;

  if(!contextFilter) {
    context.filter = 'none';
  } else {
    context.filter = contextFilter;
  };

  if(imgWidth > imgHeight) {
    var newHeight = imgWidth / canvWidth * 100;

    if(newHeight <= 100) {
      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (imgWidth - 40) / 2,
        canvHeight / 2 - (imgHeight - 40) / 2,
        imgWidth - 40, imgHeight - 40);
    } else {
      var factor = newHeight / 100,
          drawHeight = imgHeight / factor;

      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (canvWidth - 40) / 2,
        canvHeight / 2 - (drawHeight - 40) / 2,
        canvWidth - 40, drawHeight - 40);
    };
  } else if(imgHeight >= imgWidth) {
    var newWidth = imgHeight / canvHeight * 100;

    if(newWidth <= 100) {
      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (imgWidth - 40) / 2,
        canvHeight / 2 - (imgHeight - 40) / 2,
        imgWidth - 40, imgHeight - 40);
    } else {
      var factor = newWidth / 100,
          drawWidth = imgWidth / factor;

      context.clearRect(0, 0, canvWidth, canvHeight);
      context.drawImage(img,
        canvWidth / 2 - (drawWidth - 40) / 2,
        canvHeight / 2 - (canvHeight - 40) / 2,
        drawWidth - 40, canvHeight - 40);
    };
  };
};

function resetAll() {
  document.getElementById('controlsInit').classList.add('empty');
  document.getElementById('filterList').innerHTML = '';
  document.getElementById('sliderToggle').classList.remove('slider');
};

function destroyFilters() {
  for(var key in filters) {
    delete filters[key];
  };
  for(var key in constructed) {
    delete constructed[key];
  };
};

const saveBtn = document.getElementById('saveBtn');

saveBtn.addEventListener('click', function(e) {
  if(main.classList.contains('hasimg')) {
    e.preventDefault();
    var cropped = trimCanvas(canvas);
    let downloadLink = document.createElement('a');

    downloadLink.setAttribute('download', 'Filterr.png');

    cropped.toBlob(function(blob) {
      let url = URL.createObjectURL(blob);

      downloadLink.setAttribute('href', url);
      downloadLink.click();
    });
  } else {
    e.preventDefault();
  }
}, false);

function trimCanvas(c) {
  var ctx = c.getContext('2d'),
      copy = document.createElement('canvas').getContext('2d'),
      pixels = ctx.getImageData(0, 0, c.width, c.height),
      l = pixels.data.length,
      i,
      bound = {
          top: null,
          left: null,
          right: null,
          bottom: null
      },
      x, y;
  
  // Iterate over every pixel to find the highest
  // and where it ends on every axis ()
  for (i = 0; i < l; i += 4) {
      if (pixels.data[i + 3] !== 0) {
          x = (i / 4) % c.width;
          y = ~~((i / 4) / c.width);

          if (bound.top === null) {
              bound.top = y;
          };

          if (bound.left === null) {
              bound.left = x;
          } else if (x < bound.left) {
              bound.left = x;
          };

          if (bound.right === null) {
              bound.right = x;
          } else if (bound.right < x) {
              bound.right = x;
          };

          if (bound.bottom === null) {
              bound.bottom = y;
          } else if (bound.bottom < y) {
              bound.bottom = y;
          };
      };
  };
  
  // Calculate the height and width of the content
  var trimHeight = bound.bottom - bound.top + 1,
      trimWidth = bound.right - bound.left + 1,
      trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

  copy.canvas.width = trimWidth;
  copy.canvas.height = trimHeight;
  copy.putImageData(trimmed, 0, 0);

  // Return trimmed canvas
  return copy.canvas;
};

const resetAllBtn = document.getElementById('resetAllBtn'),
      resetModal = document.getElementById('resetModal');

resetAllBtn.addEventListener('click', function() {
  addEffectBtn.classList.remove('open');
  resetModal.classList.add('open');
}, false);

const modalCancelBtn = document.getElementById('modalCancelBtn'),
      modalYesBtn = document.getElementById('modalYesBtn');

modalCancelBtn.addEventListener('click', function() {
  resetModal.classList.remove('open');
}, false);

modalYesBtn.addEventListener('click', function() {
  resetAll();
  destroyFilters();
  constructFilters();
  resetModal.classList.remove('open');
}, false);

  const presetsBtn = document.getElementById('presetsBtn');

  presetsBtn.addEventListener('click', function() {
    const constructedPre = Object.values(constructed),
          constructedString = constructedPre.join(' ');

    console.log(constructedString);
    navigator.clipboard.writeText(constructedString);
    alert("Copied: " + constructedString);
  }, false);
