export function clearCanvasContext(context, width, height) {
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
}

export function trimContrast(lightnessStats) {
  const { minLightness, maxLightness, absoluteLightnessArray } = lightnessStats;
  absoluteLightnessArray.forEach((el) => {
    el[0] = Math.ceil(((el[0] - minLightness) / (maxLightness - minLightness)) * 255);
  });
}
