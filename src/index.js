import "./scss/styles.scss";
import CanvasManipulator from "./utils/canvasManipulator";
import createAWeightMap from "./utils/createAWeightMap";

const ref = {};
ref.reader = new FileReader();
ref.image = new Image();

ref.imgInput = document.getElementById('imageInput');
ref.imgInput.addEventListener('change', handleImageInput);

ref.startBtn = document.getElementById('startBtn');
ref.startBtn.addEventListener('click', handleClickStart);

ref.canvas = document.getElementById("main-canvas");
ref.manipulator = new CanvasManipulator(ref.canvas);

function handleImageInput(e) {
    if (e.target.files) {
        const imageFile = e.target.files[0];
        ref.reader.readAsDataURL(imageFile);
        ref.reader.onloadend = function (e) {
            ref.image.src = e.target.result;
            ref.image.onload = function (ev) {
                ref.canvas.width = ref.image.width;
                ref.canvas.height = ref.image.height;
                ref.manipulator = new CanvasManipulator(ref.canvas);
                ref.manipulator.context.drawImage(ref.image, 0, 0);
            };
        };
    }
}

function handleClickStart() {
    ref.manipulator.paintWithAscii({ fontFace: 'courier', fontSize: Math.max(Math.ceil(Math.max(ref.manipulator.width, ref.manipulator.height) / 120), 8) });
}
