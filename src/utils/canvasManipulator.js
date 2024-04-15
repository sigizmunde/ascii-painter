import createAWeightMap, { clearCanvasContext, evaluateLightness, trimContrast } from "./createAWeightMap";

export default class CanvasManipulator {
    fontsCache = new Map();

    constructor(canvas) {
        this.canvas = canvas;
    }

    get context() {
        return this.canvas.getContext("2d");
    }

    get width() {
        return this.canvas.width;
    }

    get height() {
        return this.canvas.height;
    }

    getImageData() {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    putImageData(imageData, x, y) {
        this.context.putImageData(imageData, x || 0, y || 0);
        return true;
    }

    setPixelToData(imageData, x, y, { r, g, b, alpha }) {
        const dataPosition = (y * imageData.width + x) * 4;
        [r, g, b, alpha].forEach((channel, idx) => {
            if (channel)
                imageData.data[dataPosition + idx] = channel ?? imageData.data[dataPosition + idx]
        });
        return imageData;
    }

    getPixel(x, y) {
        const imageData = this.getImageData();
        const dataPosition = (y * imageData.width + x) * 4;
        const pixelData = imageData.data.slice(dataPosition, dataPosition + 4);
        const [r, g, b, alpha] = pixelData;
        return { r, g, b, alpha };
    }

    setPixel(x, y, { r, g, b, alpha }) {
        const imageData = this.setPixelToData(this.getImageData(), x, y, { r, g, b, alpha });
        this.putImageData(imageData);
        return true;
    }

    getPixels(x, y, w, h) {
        return this.context.getImageData(x, y, w, h);
    }

    setPixels(x, y, pixelArr) {
        const width = pixelArr[0].length;
        const imageData = this.context.getImageData(x, y, width, pixelArr.length);
        pixelArr.forEach((row, y) => {
            row.forEach(({ r, g, b, alpha }, x) => {
                const offset = (width * y + x) * 4;
                imageData.data[offset] = r;
                imageData.data[offset + 1] = g;
                imageData.data[offset + 2] = b;
                imageData.data[offset + 3] = alpha;
            });
        })
        this.putImageData(imageData, x, y);
        return true;
    }

    printText(x, y, text, font) {
        if (font) {
            this.context.font = font;
        }
        this.context.fillStyle = "black";
        this.context.fillText(text, x, y);
    }

    paintWithAscii({ fontFace, fontSize = 12 }) {
        if (!this.fontsCache.get((`${fontSize}px ${fontFace}`))) {
            const newWeightMap = createAWeightMap({ fontFace, fontSize });
            this.fontsCache.set(`${fontSize}px ${fontFace}`, newWeightMap);
        }

        const { cellWidth,
            cellHeight,
            weights } = this.fontsCache.get(`${fontSize}px ${fontFace}`);

        const asciiWidth = Math.floor(this.width / cellWidth);
        const asciiHeight = Math.floor(this.height / cellHeight);

        const pictureLightnessStats = {
            minLightness: null,
            maxLightness: null,
            absoluteLightnessArray: []
        };

        for (let h = 0; h < asciiHeight; h += 1) {
            for (let w = 0; w < asciiWidth; w += 1) {
                const cellImageData = this.context.getImageData(w * cellWidth, h * cellHeight, cellWidth, cellHeight);
                // here third parameter is unnecessary
                evaluateLightness(cellImageData, pictureLightnessStats, null);
            }
        }

        trimContrast(pictureLightnessStats);
        
        const { absoluteLightnessArray } = pictureLightnessStats;

        clearCanvasContext(this.context, this.width, this.height);
        this.context.fillStyle = "black";
        this.context.font = `${fontSize}px ${fontFace}`;
        absoluteLightnessArray.forEach((el, idx) => {
            const x = (idx % asciiWidth) * cellWidth;
            const y = (Math.floor(idx / asciiWidth) + 1) * cellHeight;
            this.context.fillText(String.fromCharCode(weights.get(el[0])), x, y);
        });
    }
}