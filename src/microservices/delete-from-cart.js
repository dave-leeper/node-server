/* eslint-disable radix */
/* eslint-disable prefer-template */
const path = require('path');
const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class DeleteFromCart {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const { body } = reqInfo;
      let filePath = './private/users/';

      if (!body.username) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), body.username);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      if (!Files.existsSync(filePath + body.username)) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), body.username);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      filePath += `${body.username}/cart.json`;
      if (!body.id) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_CART_ITEM_DELETE_FAILED), body.username);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      if (!body.issue) {
        const message = I18n.get(Strings.ERROR_MESSAGE_CART_ITEM_DELETE_FAILED);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }

      let cart = [];
      const newCartItem = { id: body.id, issue: body.issue };
      if (Files.existsSync(filePath)) {
        const JSONString = Files.readFileSync(filePath);
        cart = JSON.parse(JSONString);
        for (let i = cart.length - 1; i >= 0; i--) {
          const c = cart[i];
          if (c.id.toUpperCase() !== newCartItem.id.toUpperCase()) continue;
          if (c.issue !== newCartItem.issue && parseInt(c.issue) !== newCartItem.issue && c.issue !== parseInt(newCartItem.issue)) continue;
          const successCallback = () => {
            const message = I18n.get(Strings.SUCCESS_MESSAGE_CART_ITEM_DELETED);
            inResolve && inResolve({ status: 200, send: message });
          };
          const failCallback = (error) => {
            const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_FAVORITE_DELETE_FAILED), Log.stringify(error));
            if (Log.will(Log.ERROR)) Log.error(message);
            inReject && inReject({ status: 500, send: message });
          };
          cart.splice(i, 1);
          Files.writeFileLock(
            path.resolve(filePath),
            JSON.stringify(cart),
            5,
            successCallback,
            failCallback,
          );
          return;
        }
      }
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_FAVORITE_DELETE_FAILED), body.id + body.issue + ' NOT FOUND');
      if (Log.will(Log.ERROR)) Log.error(message);
      inReject && inReject({ status: 404, send: message });
    });
  }
}
module.exports = DeleteFromCart;
