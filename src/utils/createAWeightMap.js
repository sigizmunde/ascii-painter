function clearCanvasContext(context, width, height) {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
}

export default function createAWeightMap({ fontFace, fontSize = 12 }) {
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext("2d");

    const result = {
        fontFace,
        fontSize,
        cellWidth: 1,
        cellHeight: fontSize,
        weights: null
    }

    for (let i = 32; i <= 126; i += 1) {
        const { width, fontBoundingBoxAscent: height } = newCtx.measureText(String.fromCharCode(i));
        result.cellWidth = Math.max(result.cellWidth, Math.ceil(width));
        result.cellHeight = Math.max(result.cellHeight, Math.ceil(height));
    };

    newCanvas.width = result.cellWidth;
    newCanvas.height = result.cellHeight;

    let minLightness;
    let maxLightness;
    const absoluteLightnessArray = [];

    for (let i = 32; i <= 126; i += 1) {
        clearCanvasContext(newCtx, result.cellWidth, result.cellHeight);
        newCtx.fillStyle = "black";
        newCtx.font = fontSize + "px " + fontFace;
        // TODO: replace fontSize with more presizely calculated value
        newCtx.fillText(String.fromCharCode(i), 0, fontSize);
        const newImageData = newCtx.getImageData(0, 0, result.cellWidth, result.cellHeight);
        // absoluteLightness is a sum of all channels except alpha
        const absoluteLightness = newImageData.data.reduce((acc, el, idx) => (idx + 1) % 4 ? acc + el : acc, 0);
        minLightness = minLightness ? Math.min(minLightness, absoluteLightness) : absoluteLightness;
        maxLightness = maxLightness ? Math.max(maxLightness, absoluteLightness) : absoluteLightness;
        absoluteLightnessArray.push([absoluteLightness, i]);
    }

    absoluteLightnessArray.forEach((el) => {
        el[0] = Math.ceil(((el[0] - minLightness) / (maxLightness - minLightness)) * 255);
    });

    result.weights = new Map(absoluteLightnessArray);

    for (let k = 255; k >= 0; k -= 1) {
        if (!result.weights.get(k)) {
            result.weights.set(k, result.weights.get(k + 1));
        }
    }

    return result;
}