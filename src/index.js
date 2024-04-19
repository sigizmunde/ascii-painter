import './scss/styles.scss';
import CanvasManipulator from './utils/canvasManipulator';

const ref = {};
ref.reader = new FileReader();
ref.image = new Image();

ref.canvas = document.getElementById('main-canvas');
ref.manipulator = new CanvasManipulator(ref.canvas);

function handleImageInput(e) {
  if (e.target.files) {
    const imageFile = e.target.files[0];
    ref.reader.readAsDataURL(imageFile);
    ref.reader.onloadend = (e) => {
      ref.image.src = e.target.result;
      ref.image.onload = (ev) => {
        ref.manipulator.applySourceImage(ref.image);
      };
    };
  }
}

function handleClickStart() {
  ref.manipulator.paintWithAscii({
    fontFace: 'courier',
    fontSize: Math.max(Math.ceil(Math.max(ref.manipulator.width, ref.manipulator.height) / 120), 8),
  });
}

function handleClickStartColor() {
  ref.manipulator.paintWithAscii({
    fontFace: 'courier',
    fontSize: Math.max(Math.ceil(Math.max(ref.manipulator.width, ref.manipulator.height) / 120), 8),
    colorArray: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
    ],
  });
}

function handleClickRestore() {
  ref.manipulator.restoreImage();
}

ref.imgInput = document.getElementById('imageInput');
ref.imgInput.addEventListener('change', handleImageInput);

ref.startBtn = document.getElementById('startBtn');
ref.startBtn.addEventListener('click', handleClickStart);

ref.startBtn = document.getElementById('startColorBtn');
ref.startBtn.addEventListener('click', handleClickStartColor);

ref.startBtn = document.getElementById('restoreImgBtn');
ref.startBtn.addEventListener('click', handleClickRestore);
