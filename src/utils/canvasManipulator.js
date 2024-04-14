export default class CanvasManipulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
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
        this.context.fillText(text, x, y);
    }
}