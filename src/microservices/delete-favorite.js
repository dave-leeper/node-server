/* eslint-disable radix */
const path = require('path');
const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class DeleteFavorite {
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
      filePath += `${body.username}/favorites.json`;
      if (!body.id) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_FAVORITE_DELETE_FAILED), body.username);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }
      if (!body.issue) {
        const message = I18n.get(Strings.ERROR_MESSAGE_FAVORITE_DELETE_FAILED);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 400, send: message });
        return;
      }

      let favorites = [];
      const newFavorite = { id: body.id, issue: body.issue };
      if (Files.existsSync(filePath)) {
        const JSONString = Files.readFileSync(filePath);
        favorites = JSON.parse(JSONString);
        for (let i = favorites.length - 1; i >= 0; i--) {
          const favorite = favorites[i];
          if (favorite.id.toUpperCase() !== newFavorite.id.toUpperCase()) continue;
          if (favorite.issue !== newFavorite.issue && parseInt(favorite.issue) !== newFavorite.issue && favorite.issue !== parseInt(newFavorite.issue)) continue;
          const successCallback = () => {
            const message = I18n.get(Strings.SUCCESS_MESSAGE_FAVORITE_DELETED);
            inResolve && inResolve({ status: 200, send: message });
          };
          const failCallback = (error) => {
            const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_FAVORITE_DELETE_FAILED), Log.stringify(error));
            if (Log.will(Log.ERROR)) Log.error(message);
            inReject && inReject({ status: 500, send: message });
          };
          favorites.splice(i, 1);
          Files.writeFileLock(
            path.resolve(filePath),
            JSON.stringify(favorites),
            5,
            successCallback,
            failCallback,
          );
          return;
        }
      }
      // eslint-disable-next-line prefer-template
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_FAVORITE_DELETE_FAILED), body.id + body.issue + ' NOT FOUND');
      if (Log.will(Log.ERROR)) Log.error(message);
      inReject && inReject({ status: 404, send: message });
    });
  }
}
module.exports = DeleteFavorite;
