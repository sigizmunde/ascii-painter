import createAWeightMap from './createAWeightMap';
import evaluateLightness from './evaluateLightness';
import { clearCanvasContext, trimContrast } from './functions';

export default class CanvasManipulator {
  fontsCache = new Map();

  constructor(canvas) {
    this.canvas = canvas;
  }

  get context() {
    return this.canvas.getContext('2d');
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  applySourceImage(image) {
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.context.drawImage(image, 0, 0);

    // clone image from main canvas into virtual sourceCanvas
    this.sourceCanvas = document.createElement('canvas');
    this.sourceCanvas.width = this.width;
    this.sourceCanvas.height = this.height;
    this.sourceCtx = this.sourceCanvas.getContext('2d');
    this.sourceCtx.drawImage(this.canvas, 0, 0);
  }

  getImageData() {
    return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  putImageData(imageData, x, y) {
    this.context.putImageData(imageData, x || 0, y || 0);
    return true;
  }

  static setPixelToData(imageData, x, y, {
    r, g, b, alpha,
  }) {
    const dataPosition = (y * imageData.width + x) * 4;
    [r, g, b, alpha].forEach((channel, idx) => {
      if (channel) {
        imageData.data[dataPosition + idx] = channel ?? imageData.data[dataPosition + idx];
      }
    });
    return imageData;
  }

  getPixel(x, y) {
    const imageData = this.getImageData();
    const dataPosition = (y * imageData.width + x) * 4;
    const pixelData = imageData.data.slice(dataPosition, dataPosition + 4);
    const [r, g, b, alpha] = pixelData;
    return {
      r,
      g,
      b,
      alpha,
    };
  }

  setPixel(x, y, {
    r, g, b, alpha,
  }) {
    const imageData = this.setPixelToData(this.getImageData(), x, y, {
      r,
      g,
      b,
      alpha,
    });
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
      row.forEach(({
        r, g, b, alpha,
      }, x) => {
        const offset = (width * y + x) * 4;
        imageData.data[offset] = r;
        imageData.data[offset + 1] = g;
        imageData.data[offset + 2] = b;
        imageData.data[offset + 3] = alpha;
      });
    });
    this.putImageData(imageData, x, y);
    return true;
  }

  printText(x, y, text, font) {
    if (font) {
      this.context.font = font;
    }
    this.context.fillStyle = 'black';
    this.context.fillText(text, x, y);
  }

  // colorArray [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]] is for CMY model
  // colorArray [[1, 1, 1, 0]] is for black and white model
  paintWithAscii({ fontFace, fontSize = 12, colorArray = [[1, 1, 1, 0]] }) {
    if (!this.fontsCache.get(`${fontSize}px ${fontFace}`)) {
      const newWeightMap = createAWeightMap({ fontFace, fontSize });
      this.fontsCache.set(`${fontSize}px ${fontFace}`, newWeightMap);
    }

    const { cellWidth, cellHeight, weights } = this.fontsCache.get(`${fontSize}px ${fontFace}`);

    clearCanvasContext(this.context, this.width, this.height);

    colorArray.forEach((colorMatrix, colorIndex, colorArr) => {
      const asciiWidth = Math.floor(this.sourceCanvas.width / cellWidth);
      const asciiHeight = Math.floor(this.sourceCanvas.height / cellHeight);

      const pictureLightnessStats = {
        minLightness: null,
        maxLightness: null,
        absoluteLightnessArray: [],
      };

      for (let h = 0; h < asciiHeight; h += 1) {
        for (let w = 0; w < asciiWidth; w += 1) {
          const cellImageData = this.sourceCtx.getImageData(
            w * cellWidth,
            h * cellHeight,
            cellWidth,
            cellHeight,
          );
          // here third parameter is unnecessary
          evaluateLightness(cellImageData, pictureLightnessStats, null, colorMatrix);
        }
      }

      trimContrast(pictureLightnessStats);

      const { absoluteLightnessArray } = pictureLightnessStats;

      this.context.globalCompositeOperation = 'multiply';
      this.context.fillStyle = `rgba(${colorMatrix
        .map((el, idx) => (idx !== 3 ? (1 - el) * 255 : 1 - el))
        .join(', ')})`;
      this.context.font = `${fontSize}px ${fontFace}`;
      absoluteLightnessArray.forEach((el, idx) => {
        const x = (idx % asciiWidth) * cellWidth + (cellWidth * colorIndex) / colorArr.length;
        const y = (Math.floor(idx / asciiWidth) + 1) * cellHeight
          + (cellHeight * colorIndex) / colorArr.length;
        this.context.fillText(String.fromCharCode(weights.get(el[0])), x, y);
      });
    });
  }

  restoreImage() {
    if (this.sourceCanvas) {
      this.context.globalCompositeOperation = 'source-over';
      this.context.drawImage(this.sourceCanvas, 0, 0);
    }
  }
}
