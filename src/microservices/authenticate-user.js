const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');
const AddAccount = require('./add-account');

class AuthenticateUser {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      console.log('AuthenticateUser');
      const message = Strings.format(I18n.get(Strings.LOGIN_SUCCESSFUL), reqInfo.params.username);
      // this.doRemember(reqInfo, reqInfo.body.username);
      if (Log.will(Log.INFO)) Log.info(message);
      inResolve && inResolve({ status: 200, send: message });
    });
  }

  doRemember(reqInfo, username) {
    const { rememberMe } = reqInfo.body;
    if (rememberMe === 'true') {
      AddAccount.rememberUser(reqInfo, username);
    } else {
      AddAccount.forgetUser(reqInfo, username);
    }
  }
}
module.exports = AuthenticateUser;
