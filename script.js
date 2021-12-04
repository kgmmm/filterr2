
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
      // saveFilters();
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 150;

      loadImg();
      // loadSaved();
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 150;
    }
  }, 250);
});

const fileControl = document.getElementById('uploadBtn');

fileControl.addEventListener('change', loadImg);

function loadImg() {
  var file, fr, img;

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
    // resetAll();
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

  function imgLoaded() {
    const context = canvas.getContext('2d'),
          imgWidth = img.naturalWidth,
          imgHeight = img.naturalHeight,
          canvWidth = canvas.width,
          canvHeight = canvas.height;

    context.imageSmoothingEnabled = true;

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
      }
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
      }
    }
  }
}

const controlsDiv = document.getElementById('controlsInit');

function initControls() {
  controlsDiv.classList.remove('init');
}

const filterChoices = document.querySelectorAll('.filterChoice');

filterChoices.forEach(choice => {
  choice.addEventListener('click', function() {
    addEffectBtn.classList.remove('open');
    controlsDiv.classList.remove('empty');
    createIcon(choice);
  });
});

function createIcon(choice) {
  const filterChoice = choice.innerHTML,
        filterIcons = document.querySelectorAll('.filterIcon'),
        newFilterEl = document.createElement('li'),
        newFilterElClass = newFilterEl.classList.add('filterIcon'),
        newFilterElSubClass = newFilterEl.classList.add('filterIcon--' + filterChoice),
        newFilterElAttr = newFilterEl.setAttribute('data-filter', filterChoice),
        filterIconList = document.getElementById('filterList'),
        newFilterElIndex = newFilterEl.setAttribute('data-index', filterIcons.length + 1);

  filterIconList.appendChild(newFilterEl);

  newFilterEl.addEventListener('click', function(e) {
    setCurrent(filterChoice, e);
  }, false);
};

const sliderToggle = document.getElementById("sliderToggle"),
      removeBtn = document.getElementById('removeBtn'),
      doneBtn = document.getElementById('doneBtn');

function setCurrent(current, e) {
  const currentIndex = e.target.getAttribute('data-index');

  removeBtn.setAttribute('data-currentIndex', currentIndex);
  sliderToggle.classList.add('slider');
};

removeBtn.addEventListener('click', function() {
  const currentIndex = removeBtn.getAttribute('data-currentIndex'),
        numOfIcons = document.querySelectorAll('.filterIcon');

  if(numOfIcons.length >=2) {
    sliderToggle.classList.remove('slider');
    document.querySelector('[data-index="' + currentIndex + '"]').remove();
  } else {
    sliderToggle.classList.remove('slider');
    document.querySelector('[data-index="' + currentIndex + '"]').remove();
    controlsDiv.classList.add('empty');
  }
});

doneBtn.addEventListener('click', function() {
  sliderToggle.classList.remove('slider'); // temp
});
