export function clearCanvasContext(context, width, height) {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
}

// this function modifies lightnessStats object
export function evaluateLightness(imageData, lightnessStats, identifier) {
    const { minLightness, maxLightness, absoluteLightnessArray } = lightnessStats;
    const absoluteLightness = imageData.data.reduce((acc, el, idx) => (idx + 1) % 4 ? acc + el : acc, 0);
    lightnessStats.minLightness = minLightness ? Math.min(minLightness, absoluteLightness) : absoluteLightness;
    lightnessStats.maxLightness = maxLightness ? Math.max(maxLightness, absoluteLightness) : absoluteLightness;
    absoluteLightnessArray.push([absoluteLightness, identifier]);
}

export function trimContrast(lightnessStats) {
    const { minLightness, maxLightness, absoluteLightnessArray } = lightnessStats;
    absoluteLightnessArray.forEach((el) => {
        el[0] = Math.ceil(((el[0] - minLightness) / (maxLightness - minLightness)) * 255);
    });
}

export default function createAWeightMap({ fontFace, fontSize = 12 }) {
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext("2d");
    newCtx.fillStyle = "black";
    newCtx.font = fontSize + "px " + fontFace;

    const result = {
        fontFace,
        fontSize,
        cellWidth: Math.round(newCtx.measureText("W").width),
        cellHeight: fontSize,
        weights: null
    }

    // skipping this to for simple big W measure
    // for (let i = 32; i <= 126; i += 1) {
    //     const { width, fontBoundingBoxAscent: height } = newCtx.measureText(String.fromCharCode(i));
    //     result.cellWidth = Math.max(result.cellWidth, Math.ceil(width));
    //     result.cellHeight = Math.max(result.cellHeight, Math.ceil(height));
    // };

    newCanvas.width = result.cellWidth;
    newCanvas.height = result.cellHeight;

    const newLightnessStats = {
        minLightness: null,
        maxLightness: null,
        absoluteLightnessArray: []
    };

    for (let i = 32; i <= 126; i += 1) {
        clearCanvasContext(newCtx, result.cellWidth, result.cellHeight);
        newCtx.fillStyle = "black";
        newCtx.font = fontSize + "px " + fontFace;
        // TODO: replace fontSize with more presizely calculated value
        newCtx.fillText(String.fromCharCode(i), 0, fontSize);
        const newImageData = newCtx.getImageData(0, 0, result.cellWidth, result.cellHeight);
        // absoluteLightness is a sum of all channels except alpha
        evaluateLightness(newImageData, newLightnessStats, i);
    }

    trimContrast(newLightnessStats);

    result.weights = new Map(newLightnessStats.absoluteLightnessArray);

    for (let k = 255; k >= 0; k -= 1) {
        if (!result.weights.get(k)) {
            result.weights.set(k, result.weights.get(k + 1));
        }
    }

    return result;
}