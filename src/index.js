import "./scss/styles.scss";
import CanvasManipulator from "./utils/canvasManipulator";
import createAWeightMap from "./utils/createAWeightMap";

const canvas = document.getElementById("main-canvas");
const manipulator = new CanvasManipulator(canvas);

const printRedNoise = () => {
    const newPixels = [];
    for (let y = 0; y < 400; y += 1) {
        newPixels[y] = [];
        for (let x = 0; x < 400; x += 1) {
            newPixels[y].push({
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256 / 4),
                b: Math.floor(Math.random() * 256 / 4),
                alpha: 255,
            });
        }
    }
    manipulator.setPixels(10, 10, newPixels);
}

const aWeightMapArial = createAWeightMap({ fontFace: 'Arial', fontSize: 12 });
console.log(aWeightMapArial);