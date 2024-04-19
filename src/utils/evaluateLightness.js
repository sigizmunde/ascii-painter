// this function modifies lightnessStats object over all pixels of incoming imageData
// matrix sets multiplier coeffs for color [r, g, b, alpha] channels
// (by default [1, 1, 1, 0] checks overall lightness ignoring opacity)
export default function evaluateLightness(
  imageData,
  lightnessStats,
  identifier,
  matrix = [1, 1, 1, 0],
) {
  const { minLightness, maxLightness, absoluteLightnessArray } = lightnessStats;
  const absoluteLightness = imageData.data.reduce((acc, el, idx) => {
    const multiplier = matrix[idx % 4];
    return acc + el * multiplier;
  }, 0);
  lightnessStats.minLightness = minLightness
    ? Math.min(minLightness, absoluteLightness)
    : absoluteLightness;
  lightnessStats.maxLightness = maxLightness
    ? Math.max(maxLightness, absoluteLightness)
    : absoluteLightness;
  absoluteLightnessArray.push([absoluteLightness, identifier]);
}

/**
 * lightnessStats = {
 *  minLightness: null,
 *  maxLightness: null,
 *  absoluteLightnessArray: [
 *      [lightness:number, identifier?:unknown]
 *  ],
 * }
 */
