/* eslint-disable radix */
/* eslint-disable no-shadow */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
// https://stackoverflow.com/questions/1664140/js-function-to-calculate-complementary-colour#1664186
class Color {
  static isKindaSortaEqual(inValue1, inValue2, inTolerance) {
    if (inValue1 > (inValue2 + inTolerance)) return false;
    return !(inValue1 < (inValue2 - inTolerance));
  }

  static xlateRGB255ColorToNormalizedColor(in255Color) {
    if (in255Color > 255) in255Color = 255;
    const f255Color = in255Color * 1.00;
    return f255Color / 255.0;
  }

  static xlateRGBNormalizedColorTo255Color(inNormalizedColor) {
    if (inNormalizedColor < 0.0) inNormalizedColor = 0.0;
    if (inNormalizedColor > 1.0) inNormalizedColor = 1.0;
    return Math.round(inNormalizedColor * 255);
  }

  static xlateHSL360ColorToNormalizedColor(h, s, l) {
    return [h / 360, s / 100, l / 100];
  }

  static xlateHSLNormalizedColorTo360Color(h, s, l) {
    return [h * 360, s * 100, l * 100];
  }

  static xlateHSV360ColorToNormalizedColor(h, s, v) {
    return [h / 360, s / 100, v / 100];
  }

  static xlateHSVNormalizedColorTo360Color(h, s, v) {
    return [h * 360, s * 100, v * 100];
  }

  // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#9493060
  static xlateRGB255ToHSL360(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    let s = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  static xlateHSL360ToRGB255(hu, sa, li) {
    let r; let g; let
      b;
    const h = hu / 360;
    const s = sa / 100;
    const l = li / 100;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // http://design.geckotribe.com/colorwheel/
  static xlateRGB255ToHSV360(r, g, b) {
    const min3 = (a, b, c) => ((a < b) ? ((a < c) ? a : c) : ((b < c) ? b : c));
    const max3 = (a, b, c) => ((a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c));
    const hsv = {};
    const rgb = { r, g, b };
    const max = max3(rgb.r, rgb.g, rgb.b);
    const dif = max - min3(rgb.r, rgb.g, rgb.b);
    hsv.saturation = (max === 0.0) ? 0 : (100 * dif / max);
    if (hsv.saturation === 0) hsv.hue = 0;
    else if (rgb.r === max) hsv.hue = 60.0 * (rgb.g - rgb.b) / dif;
    else if (rgb.g === max) hsv.hue = 120.0 + 60.0 * (rgb.b - rgb.r) / dif;
    else if (rgb.b === max) hsv.hue = 240.0 + 60.0 * (rgb.r - rgb.g) / dif;
    if (hsv.hue < 0.0) hsv.hue += 360.0;
    hsv.value = Math.round(max * 100 / 255);
    hsv.hue = Math.round(hsv.hue);
    hsv.saturation = Math.round(hsv.saturation);
    return [hsv.hue, hsv.saturation, hsv.value];
  }

  static xlateHSV360ToRGB255(h, s, v) {
    const hsv = { hue: h, saturation: s, value: v };
    const rgb = {};
    if (hsv.saturation === 0) {
      rgb.r = rgb.g = rgb.b = Math.round(hsv.value * 2.55);
    } else {
      hsv.hue /= 60;
      hsv.saturation /= 100;
      hsv.value /= 100;
      const i = Math.floor(hsv.hue);
      const f = hsv.hue - i;
      const p = hsv.value * (1 - hsv.saturation);
      const q = hsv.value * (1 - hsv.saturation * f);
      const t = hsv.value * (1 - hsv.saturation * (1 - f));
      switch (i) {
        case 0: rgb.r = hsv.value; rgb.g = t; rgb.b = p; break;
        case 1: rgb.r = q; rgb.g = hsv.value; rgb.b = p; break;
        case 2: rgb.r = p; rgb.g = hsv.value; rgb.b = t; break;
        case 3: rgb.r = p; rgb.g = q; rgb.b = hsv.value; break;
        case 4: rgb.r = t; rgb.g = p; rgb.b = hsv.value; break;
        default: rgb.r = hsv.value; rgb.g = p; rgb.b = q;
      }
      rgb.r = Math.round(rgb.r * 255);
      rgb.g = Math.round(rgb.g * 255);
      rgb.b = Math.round(rgb.b * 255);
    }
    return [rgb.r, rgb.g, rgb.b];
  }

  static xlateRGB255ToHex(r, g, b) {
    const locals = {
      r: parseInt(r).toString(16).padStart(2, '0'),
      g: parseInt(g).toString(16).padStart(2, '0'),
      b: parseInt(b).toString(16).padStart(2, '0'),
    };
    return (`#${locals.r}${locals.g}${locals.b}`).toUpperCase();
  }

  // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#5624139
  static xlateHexToRGB255(hex) {
    // Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ] : null;
  }

  static getTransparentColor() {
    return new Color(0, 0, 0, 0, true);
  }

  /**
     * Converts a string obtained from the toString() method back to a color
     * value and assigns that color to this Color object.
     *
     * @param {String} inColorString - A string obtained from the toString()
     * method.
     */
  static fromString(inColorString) {
    if (!inColorString) return null;
    if (inColorString === 'transparent') return Color.getTransparentColor();
    const aRGB = inColorString.replace(/rgb\(/, '').replace(/\)/g, '').replace(/ /g, '').split(',');
    return new Color(parseInt(aRGB[0]), parseInt(aRGB[1]), parseInt(aRGB[2]));
  }

  /**
     * Converts a string obtained from the toStringWithAlpha() method back
     * to a color value and assigns that color to this Color object.
     *
     * @param {String} inColorString - A string obtained from the
     * toStringWithAlpha() method.
     */
  static fromStringWithAlpha(inColorString) {
    if (!inColorString) return null;
    if (inColorString === 'transparent') return Color.getTransparentColor();
    const aRGB = inColorString.replace(/rgba\(/, '').replace(/\)/g, '').replace(/ /g, '').split(',');
    return new Color(parseInt(aRGB[0]), parseInt(aRGB[1]), parseInt(aRGB[2]), parseFloat(aRGB[3]));
  }

  /**
     * Converts a string obtained from the toOpacityString() method back to a
     * alpha value and assigns that alpha value to this Color object.
     *
     * @param {String} inColorString - A string obtained from the
     * toFilterString() method.
     */
  static fromOpacityString(inColorString) {
    if (!inColorString) return null;
    const color = new Color();
    color.a = parseFloat(inColorString);
    return color;
  }

  /**
     * Converts a string obtained from the toFilterString() method back to a
     * alpha value and assigns that alpha value to this Color object.
     *
     * @param {String} inColorString - A string obtained from the
     * toOpacityString() method.
     */
  static fromFilterString(inColorString) {
    if (!inColorString) return null;
    const color = new Color();
    const aFilter = inColorString.split('=');
    if ((!aFilter) || (aFilter.length < 2)) return null;
    const strFilter = aFilter[1].replace(/\)/g, '').replace(/ /g, '');
    color.a = (parseFloat(strFilter) / 100);
    return color;
  }

  static fromHSLString(inColorString) {
    if (!inColorString) return null;
    if (inColorString === 'transparent') return Color.getTransparentColor();
    const aHSL = inColorString.replace(/hsl\(/, '').replace(/%/g, '').replace(/\)/g, '').replace(/ /g, '')
      .split(',');
    const aRGB = Color.xlateHSL360ToRGB255(aHSL[0], aHSL[1], aHSL[2]);
    return new Color(aRGB[0], aRGB[1], aRGB[2]);
  }

  static fromHSLAString(inColorString) {
    if (!inColorString) return null;
    if (inColorString === 'transparent') return Color.getTransparentColor();
    const aHSLA = inColorString.replace(/hsla\(/, '').replace(/%/g, '').replace(/\)/g, '').replace(/ /g, '')
      .split(',');
    const aRGB = Color.xlateHSL360ToRGB255(aHSLA[0], aHSLA[1], aHSLA[2]);
    return new Color(aRGB[0], aRGB[1], aRGB[2], parseFloat(aHSLA[3]));
  }

  static fromHexString(inColorString) {
    if (!inColorString) return null;
    if (inColorString === 'transparent') return Color.getTransparentColor();
    const aRGB = Color.xlateHexToRGB255(inColorString);
    return new Color(aRGB[0], aRGB[1], aRGB[2]);
  }

  /**
     * Returns a normalized version (color values range from 0 to 1)
     * of the color. This is a new color and this object doesn't change.
     *
     * @returns {Color} A normalized version of this color.
     */
  static getNormalizedColor(color) {
    const oNormalized = new Color(color.r, color.g, color.b, color.a, color.transparent);
    if (!color.normalized) {
      oNormalized.r = Color.xlateRGB255ColorToNormalizedColor(color.r);
      oNormalized.g = Color.xlateRGB255ColorToNormalizedColor(color.g);
      oNormalized.b = Color.xlateRGB255ColorToNormalizedColor(color.b);
      oNormalized.normalized = true;
    }
    return oNormalized;
  }

  /**
     * Returns a 255 version (color values range from 0 to 255)
     * of the color. This is a new color and this object doesn't change.
     *
     * @returns {Color} A 255 version of this color.
     */
  static get255Color(color) {
    const o255 = new Color(color.r, color.g, color.b, color.a, color.transparent);
    if (color.normalized) {
      o255.r = Color.xlateRGBNormalizedColorTo255Color(color.r);
      o255.g = Color.xlateRGBNormalizedColorTo255Color(color.g);
      o255.b = Color.xlateRGBNormalizedColorTo255Color(color.b);
      o255.normalized = false;
    }
    return o255;
  }

  /**
     * Clones a color object.
     * @param {Color} color: A color.
     * @returns {Color} A clone of the original color.
     */
  static clone(color) {
    return new Color(color.r, color.g, color.b, color.a, color.transparent, color.normalized);
  }

  /**
     * Creates a color constrained to the range of valid values.
     * @param {Color} color: A color.
     * @returns {Color} A version of the original color clamped to valid values.
     */
  static clamp(color) {
    const newColor = Color.clone(color);
    if (newColor.transparent !== true) newColor.transparent = false;
    if (newColor.normalized !== true) newColor.normalized = false;
    const max = (newColor.normalized) ? 1.0 : 255;
    if (newColor.r < 0) newColor.r = 0;
    if (newColor.g < 0) newColor.g = 0;
    if (newColor.b < 0) newColor.b = 0;
    if (newColor.a < 0.0) newColor.a = 0.0;
    if (newColor.r > max) newColor.r = max;
    if (newColor.g > max) newColor.g = max;
    if (newColor.b > max) newColor.b = max;
    if (newColor.a > 1.0) newColor.a = 1.0;
    return newColor;
  }

  /**
     * Creates an inverted color.
     * @param {Color} color: A color.
     * @returns {Color} An inverted version of the original color.
     */
  static invert(color) {
    const newColor = Color.get255Color(color);
    newColor.r = 255 - newColor.r;
    newColor.g = 255 - newColor.g;
    newColor.b = 255 - newColor.b;
    return newColor;
  }

  /**
     * grayscale
     * Grayscales this color.
     * @param {Color} color: A color.
     * @returns {Color} An greyscale version of the original color.
     */
  static greyscale(color) {
    const newColor = Color.clone(color);
    let fLuminance = newColor.r * 0.299;
    fLuminance += newColor.g * 0.587;
    fLuminance += newColor.b * 0.114;
    if (!newColor.normalized) fLuminance = Math.round(fLuminance);
    newColor.r = fLuminance;
    newColor.g = fLuminance;
    newColor.b = fLuminance;
    return newColor;
  }

  static get blendOperation() {
    return {
      CROSS: 1,
      ADDITIVE: 2,
      ADDITIVE_ALPHA: 3,
      MULTIPLIED: 4,
    };
  }

  /**
     * Blends two colors.
     *
     * @param {Color} color1: A color.
     * @param {Color} color2: A color.
     * @param {Integer} inBlendOperation: The blend operation.
     * @returns {Color} An color created by blending the two original colors.
     */
  static blend(color1, color2, inBlendOperation) {
    const color1Normalized = Color.getNormalizedColor(color1);
    let color2Normalized = Color.getNormalizedColor(color2);
    if (Color.blendOperation.CROSS === inBlendOperation) {
      color2Normalized.r = (color2Normalized.r * (1.0 - color1Normalized.a) + color1Normalized.r * color1Normalized.a);
      color2Normalized.g = (color2Normalized.g * (1.0 - color1Normalized.a) + color1Normalized.g * color1Normalized.a);
      color2Normalized.b = (color2Normalized.b * (1.0 - color1Normalized.a) + color1Normalized.b * color1Normalized.a);
      color2Normalized.a = (color2Normalized.a * (1.0 - color1Normalized.a) + color1Normalized.a * color1Normalized.a);
    } else if (Color.blendOperation.ADDITIVE === inBlendOperation) {
      color2Normalized.r += color1Normalized.r;
      color2Normalized.g += color1Normalized.g;
      color2Normalized.b += color1Normalized.b;
      color2Normalized.a += color1Normalized.a;
    } else if (Color.blendOperation.ADDITIVE_ALPHA === inBlendOperation) {
      color2Normalized.r += color1Normalized.r * color1Normalized.a;
      color2Normalized.g += color1Normalized.g * color1Normalized.a;
      color2Normalized.b += color1Normalized.b * color1Normalized.a;
      color2Normalized.a += color1Normalized.a * color1Normalized.a;
    } else if (Color.blendOperation.MULTIPLIED === inBlendOperation) {
      color2Normalized.r *= color1Normalized.r;
      color2Normalized.g *= color1Normalized.g;
      color2Normalized.b *= color1Normalized.b;
      color2Normalized.a *= color1Normalized.a;
    }
    color2Normalized = Color.clamp(color2Normalized);
    return Color.get255Color(color2Normalized);
  }

  static getDarkerColor(color, divisor) {
    const div = ((divisor) || 2);
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    const light = hsl[2] / div;
    const rgb = Color.xlateHSL360ToRGB255(hsl[0], hsl[1], light);
    return new Color(rgb[0], rgb[1], rgb[2], color.transparent, false);
  }

  static getLighterColor(color, multiplier) {
    const mul = ((multiplier) || 0.5);
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    const light = Math.min(100, hsl[2] + (hsl[2] * mul));
    const rgb = Color.xlateHSL360ToRGB255(hsl[0], hsl[1], light);
    return new Color(rgb[0], rgb[1], rgb[2], color.transparent, false);
  }

  /**
     * Rotates a hue by a given number of degrees.
     *
     * @param {Number} hue: A hue.
     * @param {Number} degrees: The number of degrees to rotate the hue.
     * @returns {Number} The rotated hue.
     */
  static rotateHue(hue, degrees) {
    hue += degrees;
    while (hue >= 360.0) hue -= 360.0;
    while (hue < 0) hue += 360.0;
    return hue;
  }

  /**
     * Returns an array containing a complementary color scheme based on the provided color.
     *
     * @param {Color} color: A color.
     * @returns {Color[]} The complementary color scheme based on the provided color.
     * @see http://www.tigercolor.com/color-lab/color-theory/color-theory-intro.htm
     */
  static getComplimentaryColorScheme(color) {
    const scheme = [color];
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    const rotatedHue = Color.rotateHue(hsl[0], 180);
    const rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    const complimentaryColor = new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false);
    scheme.push(complimentaryColor);
    return scheme;
  }

  /**
     * Returns an array containing a split complementary color scheme based on the provided color.
     *
     * @param {Color} color: A color.
     * @returns {Color[]} The split complementary color scheme based on the provided color.
     * @see http://www.tigercolor.com/color-lab/color-theory/color-theory-intro.htm
     */
  static getSplitComplimentaryColorScheme(color) {
    const scheme = [color];
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    let rotatedHue = Color.rotateHue(hsl[0], 150);
    let rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    rotatedHue = Color.rotateHue(hsl[0], 210);
    rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    return scheme;
  }

  /**
     * Returns an array containing a triad color scheme based on the provided color.
     *
     * @param {Color} color: A color.
     * @returns {Color[]} The triad color scheme based on the provided color.
     * @see http://www.tigercolor.com/color-lab/color-theory/color-theory-intro.htm
     */
  static getTriadColorScheme(color) {
    const scheme = [color];
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    let rotatedHue = Color.rotateHue(hsl[0], 120);
    let rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    rotatedHue = Color.rotateHue(hsl[0], 240);
    rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    return scheme;
  }

  /**
     * Returns an array containing an analogous color scheme based on the provided color.
     *
     * @param {Color} color: A color.
     * @returns {Color[]} The analogous color scheme based on the provided color.
     * @see http://www.tigercolor.com/color-lab/color-theory/color-theory-intro.htm
     */
  static getAnalogousColorScheme(color) {
    const scheme = [color];
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    let rotatedHue = Color.rotateHue(hsl[0], 30);
    let rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    rotatedHue = Color.rotateHue(hsl[0], -30);
    rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    return scheme;
  }

  /**
     * Returns an array containing an rectangle (tetradic) color scheme based on the provided color.
     *
     * @param {Color} color: A color.
     * @returns {Color[]} The rectangle color scheme based on the provided color.
     * @see http://www.tigercolor.com/color-lab/color-theory/color-theory-intro.htm
     */
  static getRectangleColorScheme(color) {
    const scheme = Color.getComplimentaryColorScheme(color);
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    let rotatedHue = Color.rotateHue(hsl[0], 120);
    let rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    rotatedHue = Color.rotateHue(hsl[0], -60);
    rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    return scheme;
  }

  /**
     * Returns an array containing an square color scheme based on the provided color.
     *
     * @param {Color} color: A color.
     * @returns {Color[]} The square color scheme based on the provided color.
     * @see http://www.tigercolor.com/color-lab/color-theory/color-theory-intro.htm
     */
  static getSquareColorScheme(color) {
    const scheme = Color.getComplimentaryColorScheme(color);
    const color255 = Color.get255Color(color);
    const hsl = Color.xlateRGB255ToHSL360(color255.r, color255.g, color255.b);
    let rotatedHue = Color.rotateHue(hsl[0], 90);
    let rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    rotatedHue = Color.rotateHue(hsl[0], -90);
    rgb = Color.xlateHSL360ToRGB255(rotatedHue, hsl[1], hsl[2]);
    scheme.push(new Color(rgb[0], rgb[1], rgb[2], color.a, color.transparent, false));
    return scheme;
  }

  /**
     * Assigns a number to this color.
     *
     * @param {Color} color: A color.
     * @param {Number} inNumber: The number being assigned to this color.
     * @returns {Color} Returns this.
     */
  static assign(color, inNumber) {
    const newColor = Color.clone(color);
    newColor.r = inNumber;
    newColor.g = inNumber;
    newColor.b = inNumber;
    return newColor;
  }

  /**
     * Adds a number to this color. The results are not clamped.
     *
     * @param {Color} color: A color.
     * @param {Number} inNumber: The number being added to this color.
     * @returns {Color} Returns this.
     */
  static add(color, inNumber) {
    const newColor = Color.clone(color);
    newColor.r += inNumber;
    newColor.g += inNumber;
    newColor.b += inNumber;
    return newColor;
  }

  /**
     * Subtracts a number from this color. The results are not clamped.
     *
     * @param {Color} color: A color.
     * @param {Number} inNumber: The number being subtracted from this color.
     * @returns {Color} Returns this.
     */
  static subtract(color, inNumber) {
    const newColor = Color.clone(color);
    newColor.r -= inNumber;
    newColor.g -= inNumber;
    newColor.b -= inNumber;
    return newColor;
  }

  /**
     * Multiply this color by a number. The results are not clamped.
     *
     * @param {Color} color: A color.
     * @param {Number} inNumber: The number to multiply this color.
     * @returns {Color} Returns this.
     */
  static multiply(color, inNumber) {
    const newColor = Color.clone(color);
    newColor.r *= inNumber;
    newColor.g *= inNumber;
    newColor.b *= inNumber;
    return newColor;
  }

  /**
     * Divide this color by a number. The results are not clamped.
     *
     * @param {Color} color: A color.
     * @param {Number} inNumber: The number to divide this color.
     * @returns {Color} Returns this.
     */
  static divide(color, inNumber) {
    const newColor = Color.clone(color);
    newColor.r /= inNumber;
    newColor.g /= inNumber;
    newColor.b /= inNumber;
    return newColor;
  }

  /**
     * Adds the RGB values of color 1 and color2. The results are not clamped.
     *
     * @param {Color} inColor: The color being added to this color.
     * @returns {Color} Returns a new color containing the result.
     */
  static addColor(color1, color2) {
    const newColor = Color.clone(color1);
    newColor.r += color2.r;
    newColor.g += color2.g;
    newColor.b += color2.b;
    return newColor;
  }

  /**
     * Subtracts the RGB values of color2 from color1. The results are not clamped.
     *
     * @param {Color} color1: A color.
     * @param {Color} color2: The color being subtracted from color1.
     * @returns {Color} Returns a new color containing the result.
     */
  static subtractColor(color1, color2) {
    const newColor = Color.clone(color1);
    newColor.r -= color2.r;
    newColor.g -= color2.g;
    newColor.b -= color2.b;
    return newColor;
  }

  /**
     * Represents a color value. Colors are used to color the background of the View
     * and the line drawing and fill colors used to draw Shapes. Colors have four
     * components, red, green, blue, and alpha. The red, green, and blue values combine
     * to specify a specific color. The alpha value specifies the transparency of the
     * color.
     *
     * @constructor
     * @param {Integer} [inRed] - The amount of red in the final color. Valid values are
     * integers between 0 and 255 (or 0 to 1 if the inNormalized flag is set). Defaults to zero.
     * @param {Integer} [inGreen] - The amount of green in the final color. Valid values
     * are integers between 0 and 255 (or 0 to 1 if the inNormalized flag is set). Defaults to zero.
     * @param {Integer} [inBlue] - The amount of blue in the final color. Valid values
     * are integers between 0 and 255 (or 0 to 1 if the inNormalized flag is set). Defaults to zero.
     * @param {Integer} [inAlpha] - The amount of opacity in the color. Valid values
     * are real numbers between 0 and 1. Defaults to 1.0 (a solid color).
     * @param {Boolean} [inTransparent] - True if the color is transparent (completely
     * invisible), false otherwise. Defaults to false.
     * @param {Boolean} [inNormalized] - Set this value to true to indicate color values
     * passed to the constructor are in the range of 0 to 1. Defaults to false.
     */
  constructor(inRed, inGreen, inBlue, inAlpha, inTransparent, inNormalized) {
    this.r = inRed || 0;
    this.g = inGreen || 0;
    this.b = inBlue || 0;
    this.a = inAlpha || ((inAlpha === 0) ? 0 : 1.0);
    this.transparent = inTransparent || false;
    this.normalized = inNormalized || false;
  }

  /**
     * Compares a color object to this color object to see if they are equal.
     *
     * @param {Color} inColor - The Color object to compare.
     * @param {Number} [inColorTolerance] - The tolerance used for rgb comparisons. Defaults
     * to zero.
     * @param {Number} [inAlphaTolerance] - The tolerance used for alpha comparisons. Defaults
     * to inColorTolerance.
     * @returns {Boolean} True if the two colors are equal, false otherwise.
     */
  isEqual(inColor, inColorTolerance, inAlphaTolerance) {
    const colorTolerance = (inColorTolerance) || 0;
    const alphaTolerance = (inAlphaTolerance) || colorTolerance;
    if (!Color.isKindaSortaEqual(this.r, inColor.r, colorTolerance)) return false;
    if (!Color.isKindaSortaEqual(this.g, inColor.g, colorTolerance)) return false;
    if (!Color.isKindaSortaEqual(this.b, inColor.b, colorTolerance)) return false;
    if (!Color.isKindaSortaEqual(this.a, inColor.a, alphaTolerance)) return false;
    return (this.transparent === inColor.transparent);
  }

  /**
     * Converts the color to a RGB string. If the color is transparent, the word
     * 'transparent' is returned.
     *
     * @returns {String} The color as a RGB string (i.e. rgd(RGB)). If the color is
     * transparent, the word 'transparent' is returned.
     */
  toString() {
    if (this.transparent) return 'transparent';
    const color = Color.get255Color(this);
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  /**
     * Converts the color to a RGBA string.
     *
     * @returns {String} The color as a RGBA string (i.e. rgda(RGBA)).
     */
  toStringWithAlpha() {
    if (this.transparent) return 'transparent';
    const color = Color.get255Color(this);
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  }

  /**
     * Converts the color's opacity (alpha value) to a string.
     *
     * @returns {String} The color's opacity (alpha value) as a string.
     */
  toOpacityString() {
    return `${this.a}`;
  }

  /**
     * Converts the color's opacity (alpha value) to a filter string. A
     * filter string looks like this: 'filter:alpha(opacity= alpha*100)'.
     *
     * @returns {String} The color's opacity (alpha value) as a filter string.
     */
  toFilterString() {
    const fFilter = this.a * 100;
    return `filter:alpha(opacity=${fFilter})`;
  }

  // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#9493060
  toHSLString() {
    if (this.transparent) return 'transparent';
    const color = Color.get255Color(this);
    const hsl = Color.xlateRGB255ToHSL360(color.r, color.g, color.b);
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
  }

  // https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#9493060
  toHSLAString() {
    if (this.transparent) return 'transparent';
    const color = Color.get255Color(this);
    const hsl = Color.xlateRGB255ToHSL360(color.r, color.g, color.b);
    return `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${this.a})`;
  }

  toHexString() {
    if (this.transparent) return 'transparent';
    const color = Color.get255Color(this);
    return Color.xlateRGB255ToHex(color.r, color.g, color.b);
  }
}

module.exports = Color;
