const Color = require('../util/color');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class ColorSchemes {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const { body } = reqInfo;

      if (!body.color) {
        const message = I18n.get(Strings.ERROR_NO_COLOR);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      const colorRGB = Color.fromHexString(body.color);
      const color = new Color(colorRGB.r, colorRGB.g, colorRGB.b);
      const complimentaryColor = Color.getComplimentaryColorScheme(color); // Array of 2 colors. 1st is original color.
      const splitComplimentaryColor = Color.getSplitComplimentaryColorScheme(color); // Array of 3 colors. 1st is original color.
      const triadColor = Color.getTriadColorScheme(color); // Array of 3 colors. 1st is original color.
      const analogousColor = Color.getAnalogousColorScheme(color); // Array of 3 colors. 1st is original color.
      const rectangleColor = Color.getRectangleColorScheme(color); // Array of 4 colors. 1st is original color.
      const squareColor = Color.getSquareColorScheme(color); // Array of 4 colors. 1st is original color.
      const result = { originalColor: { r: color.r, g: color.g, b: color.b } };
      result.complimentaryColor = {
        first: { r: complimentaryColor[0].r, g: complimentaryColor[0].g, b: complimentaryColor[0].b },
        second: { r: complimentaryColor[1].r, g: complimentaryColor[1].g, b: complimentaryColor[1].b },
      };
      result.splitComplimentaryColor = {
        first: { r: splitComplimentaryColor[0].r, g: splitComplimentaryColor[0].g, b: splitComplimentaryColor[0].b },
        second: { r: splitComplimentaryColor[1].r, g: splitComplimentaryColor[1].g, b: splitComplimentaryColor[1].b },
        third: { r: splitComplimentaryColor[2].r, g: splitComplimentaryColor[2].g, b: splitComplimentaryColor[2].b },
      };
      result.triadColor = {
        first: { r: triadColor[0].r, g: triadColor[0].g, b: triadColor[0].b },
        second: { r: triadColor[1].r, g: triadColor[1].g, b: triadColor[1].b },
        third: { r: triadColor[2].r, g: triadColor[2].g, b: triadColor[2].b },
      };
      result.analogousColor = {
        first: { r: analogousColor[0].r, g: analogousColor[0].g, b: analogousColor[0].b },
        second: { r: analogousColor[1].r, g: analogousColor[1].g, b: analogousColor[1].b },
        third: { r: analogousColor[2].r, g: analogousColor[2].g, b: analogousColor[2].b },
      };
      result.rectangleColor = {
        first: { r: rectangleColor[0].r, g: rectangleColor[0].g, b: rectangleColor[0].b },
        second: { r: rectangleColor[1].r, g: rectangleColor[1].g, b: rectangleColor[1].b },
        third: { r: rectangleColor[2].r, g: rectangleColor[2].g, b: rectangleColor[2].b },
        fourth: { r: rectangleColor[3].r, g: rectangleColor[3].g, b: rectangleColor[3].b },
      };
      result.squareColor = {
        first: { r: squareColor[0].r, g: squareColor[0].g, b: squareColor[0].b },
        second: { r: squareColor[1].r, g: squareColor[1].g, b: squareColor[1].b },
        third: { r: squareColor[2].r, g: squareColor[2].g, b: squareColor[2].b },
        fourth: { r: squareColor[3].r, g: squareColor[3].g, b: squareColor[3].b },
      };

      inResolve && inResolve({
        status: 200,
        viewName: 'color-schemes',
        viewObject: {
          title: 'Color Schemes',
          asJSON: JSON.stringify(result),
          originalColor: color.toHexString(),
          complimentaryColor1: complimentaryColor[0].toHexString(),
          complimentaryColor2: complimentaryColor[1].toHexString(),
          splitComplimentaryColor1: splitComplimentaryColor[0].toHexString(),
          splitComplimentaryColor2: splitComplimentaryColor[1].toHexString(),
          splitComplimentaryColor3: splitComplimentaryColor[2].toHexString(),
          triadColor1: triadColor[0].toHexString(),
          triadColor2: triadColor[1].toHexString(),
          triadColor3: triadColor[2].toHexString(),
          analogousColor1: analogousColor[0].toHexString(),
          analogousColor2: analogousColor[1].toHexString(),
          analogousColor3: analogousColor[2].toHexString(),
          rectangleColor1: rectangleColor[0].toHexString(),
          rectangleColor2: rectangleColor[1].toHexString(),
          rectangleColor3: rectangleColor[2].toHexString(),
          rectangleColor4: rectangleColor[3].toHexString(),
          squareColor1: squareColor[0].toHexString(),
          squareColor2: squareColor[1].toHexString(),
          squareColor3: squareColor[2].toHexString(),
          squareColor4: squareColor[3].toHexString(),
        },
      });
    });
  }
}
module.exports = ColorSchemes;
