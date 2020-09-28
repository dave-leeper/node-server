const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class GetAccount {
  static get userPath() { return './private/users/authentication.json'; }

  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      if (!reqInfo || !reqInfo.params || !reqInfo.params.username) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), 'undefined');
        if (Log.will(Log.ERROR)) Log.error(message);
        inResolve && inResolve({ status: 400, send: message });
        return;
      }
      let usersData;
      try {
        usersData = Files.readFileSync(GetAccount.userPath);
      } catch (e) {
        const message = I18n.get(Strings.ERROR_MESSAGE_ERROR_READING_USER_INFO);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
        return;
      }

      const usersArray = JSON.parse(usersData).accounts;
      if (!usersArray || !Array.isArray(usersArray)) {
        const message = I18n.get(Strings.ERROR_MESSAGE_ERROR_READING_USER_INFO);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
        return;
      }

      for (let i = 0; i < usersArray.length; i++) {
        if (usersArray[i].username === reqInfo.params.username) {
          const user = usersArray[i];
          inResolve && inResolve({
            status: 200,
            send: JSON.stringify({
              username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email,
            }),
          });
          return;
        }
      }
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), reqInfo.params.username);
      if (Log.will(Log.ERROR)) Log.error(message);
      inResolve && inResolve({ status: 404, send: message });
    });
  }
}
module.exports = GetAccount;
