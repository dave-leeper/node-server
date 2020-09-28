/* eslint-disable radix */
const path = require('path');
const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class AddFavorite {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const { body } = reqInfo.body;
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
      filePath += `${body.username}/favorites.json`;
      if (!body.id) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_FAVORITE_ADD_FAILED), body.username);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      if (!body.issue) {
        const message = I18n.get(Strings.ERROR_MESSAGE_FAVORITE_ADD_FAILED);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }

      let favorites = [];
      const now = new Date();
      const transactionDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      // eslint-disable-next-line radix
      const newFavorite = { id: body.id, issue: parseInt(body.issue), transactionDate };
      if (Files.existsSync(filePath)) {
        const JSONString = Files.readFileSync(filePath);
        favorites = JSON.parse(JSONString);
        for (let i = favorites.length - 1; i >= 0; i--) {
          const favorite = favorites[i];
          if (favorite.id.toUpperCase() !== newFavorite.id.toUpperCase()) continue;
          if (favorite.issue !== newFavorite.issue && parseInt(favorite.issue) !== newFavorite.issue && favorite.issue !== parseInt(newFavorite.issue)) continue;
          favorites.splice(i, 1);
        }
      }
      favorites.push(newFavorite);

      const successCallback = () => {
        const message = I18n.get(Strings.SUCCESS_MESSAGE_FAVORITE_ADDED);
        inResolve && inResolve({ status: 200, send: message });
      };
      const failCallback = (error) => {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_FAVORITE_ADD_FAILED), Log.stringify(error));
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
      };
      Files.writeFileLock(
        path.resolve(filePath),
        JSON.stringify(favorites),
        5,
        successCallback,
        failCallback,
      );
    });
  }
}
module.exports = AddFavorite;
