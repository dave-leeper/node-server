const path = require('path');
const Encrypt = require('../util/encrypt');
const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Registry = require('../util/registry');
const Strings = require('../util/strings');
const AddAccount = require('./add-account');

class UpdateAccount extends AddAccount {
  validateEmail(body, account, accounts) {
    const user = Registry.getUserAccount(account.username);
    if (!user) return { status: 404, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_USER_NOT_FOUND), body.email) };
    if (body.email === user.email) return { status: 200 };
    if (!body.email || body.email.length < 5
    || body.email.indexOf('@') === -1
    || body.email.indexOf('.') === -1) {
      return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_EMAIL), body.email) };
    }
    for (let i = 0; i < accounts.length; i++) {
      if (user.username === accounts[i].username) continue;
      if (body.email === accounts[i].email) {
        return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_EMAIL), body.email) };
      }
    }
    return { status: 200 };
  }

  validateDatabase(body) {
    if (!Files.existsSync(path.resolve(AddAccount.userPath + body.username))) return { status: 404, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_DOES_NOT_EXIST), body.username) };
    return { status: 200 };
  }

  updateAccounts(newAccount, accounts, inResolve, inReject) {
    const crypto = Registry.get('Crypto');
    const encryptedAccount = Encrypt.encryptAccount(newAccount, crypto.iv, crypto.key);
    if (accounts && accounts.length) {
      for (let i = accounts.length - 1; i >= 0; i--) {
        if (encryptedAccount.username.toUpperCase() === accounts[i].username.toUpperCase()) {
          // eslint-disable-next-line no-param-reassign
          encryptedAccount.transactionDate = accounts[i].transactionDate;
          // eslint-disable-next-line no-param-reassign
          accounts[i] = encryptedAccount;
          return { status: true, accounts };
        }
      }
    }
    const message = I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_DOES_NOT_EXIST);
    if (Log.will(Log.ERROR)) Log.error(message);
    inResolve && inResolve({ status: 404, send: message });
    return { status: false };
  }

  writeAccount(newAccount, destination, accounts, inResolve, inReject) {
    const newUserPath = path.resolve(AddAccount.userPath + newAccount.username);

    const crypto = Registry.get('Crypto');
    const successCallback = () => {
      const message = I18n.get(Strings.SUCCESS_MESSAGE_ACCOUNT_UPDATED);
      Registry.unregister('Accounts');
      Registry.register(accounts, 'Accounts');
      inResolve && inResolve({ status: 200, send: message });
    };
    const failCallback = (error) => {
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_ADD_FAILED), Log.stringify(error));
      if (Log.will(Log.ERROR)) Log.error(message);
      inReject && inReject({ status: 500, send: message });
    };
    Files.writeFileLock(
      path.resolve(destination),
      JSON.stringify({ accounts }, null, 3),
      5,
      successCallback,
      failCallback,
    );
  }
}
module.exports = UpdateAccount;
