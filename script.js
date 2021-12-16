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
    deconstructed = {},
    target,
    currentSelectedFilter,
    currentPreviewFilter;

const sliderControl = document.getElementById('sliderControl'),
      addEffectBtn = document.getElementById('addEffectBtn'),
      loader = document.getElementById('loader');

addEffectBtn.addEventListener('click', () => {
  if(Object.keys(constructed).length > 0) {
    resetAllBtn.classList.remove('disabled');
    addEffectBtn.classList.toggle('open');
  } else {
    resetAllBtn.classList.add('disabled');
    addEffectBtn.classList.toggle('open');
  }
});

var resizeEvt;
const main = document.getElementById('main'),
      canvas = document.getElementById('imgcanv');

window.addEventListener('load', function() {
  resizeCanv();

  for(var key in localStorage) {
    if(key.substring(0, 6) == 'USRPRE') {
      createNewUSRPRE(key.substring(6), localStorage[key], false);
    };
  };
}, false);

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
    loader.classList.add('show');
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
  loader.classList.remove('show');
  saveBtn.classList.remove('hidden');
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

filterIconList.addEventListener('wheel', (e) => {
  e.preventDefault();
  filterIconList.scrollLeft += (e.deltaY + e.deltaX);
}, false);

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
  let minMax = Number( (sliderControl.value - sliderControl.min) * 100 / (sliderControl.max - sliderControl.min) ),
      bubblePos = 10 - (minMax * 0.2);

  sliderIndicator.style.left = 'calc(' + minMax + '% + (' + bubblePos + 'px))';

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
  delete constructed[target];

  if(numOfIcons.length > 1) {
    sliderToggle.classList.remove('slider');
    iconTarget.remove();
    applyFilters();
  } else {
    sliderToggle.classList.remove('slider');
    iconTarget.remove();
    controlsDiv.classList.add('empty');
    applyFilters();
  };
});

doneBtn.addEventListener('click', function() {
  updateIndicator('', false);
  sliderToggle.classList.remove('slider');
});

function constructFilters() {
  if(Object.keys(filters).length > 0) {
    for(var key in filters) {
      var filterName = filters[key][0],
          filterValue = filters[key][1],
          unit = '%';

      if(filterName === 'HueRotate') {
        constructed[key] = 'Hue-Rotate(' + filterValue +  'deg)';
        applyFilters();
      } else {
        constructed[key] = filterName + '(' + filterValue + unit + ')';
        applyFilters();
      };
    };
  } else {
    constructed = {};
    applyFilters();
  };
};

function applyFilters() {
  const filterStringValues = Object.values(constructed),
        filterString = filterStringValues.join(' ');

  redrawImage(filterString);
  currentSelectedFilter = filterString;
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
  currentSelectedFilter = '';
  currentPreviewFilter = '';
};

const saveBtn = document.getElementById('saveBtn');

saveBtn.addEventListener('click', function(e) {
  if(saveBtn.classList.contains('hidden')) {
    e.preventDefault();
  } else {
    e.preventDefault();
    loader.classList.add('show');

    var downloadImg = createDownloadImg(img, currentSelectedFilter, false);
    let downloadLink = document.createElement('a');

    downloadLink.setAttribute('download', 'filterr.png');

    downloadImg.toBlob(function(blob) {
      let url = URL.createObjectURL(blob);

      downloadLink.setAttribute('href', url);
      downloadLink.click();
      loader.classList.remove('show');
    });
  }
}, false);

function createDownloadImg(img, filterToAdd, doResize) {
  const newCanv = document.createElement('canvas'),
        newContext = newCanv.getContext('2d');

  if(doResize == true) {
    if(img.naturalWidth > img.naturalHeight) {
      let ratio = img.naturalWidth / img.naturalHeight,
          newHeight = 500 / ratio;

      newCanv.width = 500;
      newCanv.height = newHeight;

      newContext.imageSmoothingEnabled = true;
      newContext.filter = filterToAdd;
      newContext.drawImage(img, 0, 0, 500, newHeight);
    } else if(img.naturalWidth < img.naturalHeight) {
      let ratio = img.naturalHeight / img.naturalWidth,
          newWidth = 500 / ratio;

      newCanv.height = 500;
      newCanv.width = newWidth;

      newContext.imageSmoothingEnabled = true;
      newContext.filter = filterToAdd;
      newContext.drawImage(img, 0, 0, newWidth, 500);
    } else {
      newContext.height = 500;
      newCanv.width = 500;

      newContext.imageSmoothingEnabled = true;
      newContext.filter = filterToAdd;
      newContext.drawImage(img, 0, 0, 500, 500);
    };
  } else if(doResize == false) {
    newCanv.width = img.naturalWidth;
    newCanv.height = img.naturalHeight;


    newContext.imageSmoothingEnabled = false;
    newContext.filter = filterToAdd;
    newContext.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
  } else {
    return false;
  };
  return newContext.canvas;
}

const resetAllBtn = document.getElementById('resetAllBtn'),
      resetModal = document.getElementById('resetModal');

resetAllBtn.addEventListener('click', function() {
  const numOfIcons = document.querySelectorAll('.filterIcon');

  if(numOfIcons.length > 0) {
    addEffectBtn.classList.remove('open');
    resetModal.classList.add('open');
  } else {
    return false;
  }
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

var getSiblings = function (elem) {
  return Array.prototype.filter.call(elem.parentNode.children, function (sibling) {
    return sibling !== elem;
  });
};

var presets = {
      stainedOldPhoto: 'Sepia(70%) Contrast(110%) Brightness(120%)',
      filmNegative: 'Contrast(140%) Brightness(130%) Invert(100%) Grayscale(80%)'
    },
    userPresets = {};

const presetsBtn = document.getElementById('presetsBtn'),
      presetsMenu = document.getElementById('presetsMenu'),
      presetsList = document.getElementById('presetsList'),
      presetListItems = document.querySelectorAll('li#preset'),
      userPresetNewBtn = document.getElementById('userPresetNewBtn'),
      userPresetPlaceholder = document.getElementById('userPresetPlaceholder'),
      menuContentWrapper = document.getElementById('menuContentWrapper'),
      presetPreviewImg = document.getElementById('presetPreviewImg');

presetsBtn.addEventListener('click', function() {
  setPreview(currentSelectedFilter);

  presetsApplyBtn.classList.remove('show');

  const anyActive = document.querySelector('.active');

  if(anyActive != null) {
    anyActive.classList.remove('active');
  };

  if(Object.keys(constructed).length > 0) {
    userPresetNewBtn.style.display = 'grid';
  } else {
    userPresetNewBtn.style.display = 'none';
  };

  addEffectBtn.classList.remove('open');
  controlsDiv.classList.add('init');

  presetListItems.forEach(item => {
    if(item.classList.contains('active')) {
      item.classList.remove('active');
    };
  });

  presetsMenu.classList.add('open');
}, false);

function setPreview(filterTarget) {
  currentPreviewFilter = filterTarget;

  var updatePreviewImg = createDownloadImg(img, currentPreviewFilter, true),
      newDataURL = updatePreviewImg.toDataURL();

  if(presetPreviewImg.style.backgroundImage != 'url(' + newDataURL + ')') {
    presetPreviewImg.style.backgroundImage = 'url(' + newDataURL + ')';
  };
};

presetListItems.forEach(item => {
  item.addEventListener('click', function() {
    listItemClick(item);
  }, false);
});

function listItemClick(item) {
  if(item.classList.contains('active') || item.classList.contains('placeholder')) {
    return false;
  }
  const presetID = item.getAttribute('data-presetID');

  item.classList.add('active');

  var siblings = getSiblings(item);

  siblings.forEach(sibling => {
    sibling.classList.remove('active');
  });

  if(item.classList.contains('userPreset')) {
    setPreview(localStorage['USRPRE' + presetID]);
  } else {
    setPreview(presets[presetID]);
  };

  if(currentPreviewFilter == currentSelectedFilter) {
    presetsApplyBtn.classList.remove('show');
  } else {
    presetsApplyBtn.classList.add('show');
  }
};

const newPresetNameInput = document.getElementById('newPresetName'),
      userPresetSaveBtn = document.getElementById('userPresetSaveBtn');

newPresetNameInput.addEventListener('input', checkName, false);
newPresetNameInput.addEventListener('change', checkName, false);

function checkName() {
  if(newPresetNameInput.value != '') {
    userPresetSaveBtn.classList.remove('disabled');
  } else {
    userPresetSaveBtn.classList.add('disabled');
  };
};

const newPresetPrint = document.getElementById('newPresetPrint'),
      previewToggle = document.getElementById('previewToggle');

userPresetNewBtn.addEventListener('click', function() {
  const rawConstructed = Object.values(constructed),
        fullString = rawConstructed.join(' ');

  presetsApplyBtn.classList.remove('show');
  previewToggle.classList.remove('previewOff');
  setPreview(currentSelectedFilter);

  newPresetPrint.innerHTML = fullString;
  newPresetNameInput.value = '';
  checkName();
  menuContentWrapper.classList.add('save');
}, false);

const userPresetBackBtn = document.getElementById('userPresetBackBtn');

userPresetBackBtn.addEventListener('click', function() {
  setPreview(currentSelectedFilter);
  presetsApplyBtn.classList.remove('show');
  
  const anyActive = document.querySelector('.active');

  if(anyActive != null) {
    anyActive.classList.remove('active');
  };

  menuContentWrapper.classList.remove('save');
}, false);

userPresetSaveBtn.addEventListener('click', function() {
  const newPresetName = document.getElementById('newPresetName').value,
        newPresetString = Object.values(constructed).join(' ');

  if(userPresetSaveBtn.classList.contains('disabled')) {
    return false;
  } else {
    if(localStorage['USRPRE' + newPresetName]) {
      alert("That name already exists. Choose a new unique name..");
      return false;
    }
    localStorage.setItem('USRPRE' + newPresetName, newPresetString);
    setPreview(currentSelectedFilter);

    const anyActive = document.querySelector('.active');

    if(anyActive != null) {
      anyActive.classList.remove('active');
    };

    document.getElementById('newPresetName').value = '';
    newPresetPrint.innerHTML = '';
    createNewUSRPRE(newPresetName, newPresetString, true);
    menuContentWrapper.classList.remove('save');
  };
}, false);

function createNewUSRPRE(name, string, setActive) {
  const newLi = document.createElement('li');

  if(userPresetPlaceholder.classList.contains('visible')) {
    userPresetPlaceholder.classList.remove('visible');
  };

  newLi.setAttribute('id', 'preset');
  newLi.classList.add('userPreset');
  newLi.setAttribute('data-presetID', name);
  newLi.innerHTML = '<span>' + name + '</span><button class="userPresetDelete" id="userPresetDelete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></button>';
  newLi.addEventListener('click', function() { listItemClick(this) }, false);
  newLi.querySelector('.userPresetDelete').addEventListener('click', function() { deleteUserLi(this) }, false);

  if(setActive) {
    newLi.classList.add('active');
  };

  presetsList.appendChild(newLi);
};

previewToggle.addEventListener('click', function() {
  if(previewToggle.classList.contains('previewOff')) {
    setPreview(currentSelectedFilter);
    previewToggle.classList.remove('previewOff');
  } else {
    setPreview();
    previewToggle.classList.add('previewOff');
  };
}, false);

const userPresetDeleteBtns = document.querySelectorAll('.userPresetDelete');

userPresetDeleteBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    deleteUserLi(btn);
  }, false);
});

function deleteUserLi(btn) {
  const parentLi = btn.parentNode,
        liCount = document.querySelectorAll('.userPreset'),
        presetToDelete = parentLi.getAttribute('data-presetID');

  if(parentLi.classList.contains('active')) {
    setPreview(currentSelectedFilter);
    presetsApplyBtn.classList.remove('show');
  };

  parentLi.classList.add('active');
  localStorage.removeItem('USRPRE' + presetToDelete);

  if(liCount.length < 3) {
    presetsList.removeChild(parentLi);
    userPresetPlaceholder.classList.add('visible');
  } else {
    presetsList.removeChild(parentLi);
  };
};

const presetsCloseBtn = document.getElementById('presetsCloseBtn');

presetsCloseBtn.addEventListener('click', function() {
  controlsDiv.classList.remove('init');
  presetsMenu.classList.remove('open');
  menuContentWrapper.classList.remove('save');
  presetsApplyBtn.classList.remove('show');
}, false);

const presetsApplyBtn = document.getElementById('presetsApplyBtn');

presetsApplyBtn.addEventListener('click', function() {
  currentSelectedFilter = currentPreviewFilter;
  resetAll();
  presetsMenu.classList.remove('open');
  presetsApplyBtn.classList.remove('show');
  controlsDiv.classList.remove('init');

  deconstructed = currentSelectedFilter.split(' ');
  destroyFilters();

  deconstructed.forEach(entry => {
    createIconFromPreset(entry);
  });

  controlsDiv.classList.remove('empty');
  constructFilters();
}, false);

function createIconFromPreset(choice) {
  let choiceGetValue = /\d+/g,
      choiceValue = choice.match(choiceGetValue);

  let choiceGetFilter = /[^\d+()%\-]/g,
      choiceRawFilter = choice.match(choiceGetFilter),
      choiceFilter = choiceRawFilter.join('');
      
  if(choiceFilter == 'HueRotatedeg') choiceFilter = 'HueRotate';

  const filterChoice = choiceFilter,
        newFilterEl = document.createElement('li'),
        newFilterElClass = newFilterEl.classList.add('filterIcon'),
        newFilterElSubClass = newFilterEl.classList.add('filterIcon--' + filterChoice),
        newFilterElLabel = newFilterEl.setAttribute('data-filter', filterChoice),
        filterIconUniqID = 'a' + Date.now() + Math.random(),
        newFilterUniqID = newFilterEl.setAttribute('id', filterIconUniqID);

  target = newFilterEl.getAttribute('id');

  filters[target] = new Array();

  filters[target].push(filterChoice);
  filters[target].push(choiceValue);

  filterIconList.appendChild(newFilterEl);

  let fallbackTarget = document.getElementById(target);

  newFilterEl.addEventListener('click', function(e) {
    setCurrent(filterChoice, e);
  }, false);
};
