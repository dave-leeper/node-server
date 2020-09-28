/* eslint-disable no-bitwise */
const path = require('path');
const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Registry = require('../util/registry');
const Strings = require('../util/strings');
const AddAccount = require('./add-account');

class DeleteAccount {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      try {
        let foundUser = false;
        const { body } = reqInfo;
        if (!body) {
          const message = I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME);
          if (Log.will(Log.ERROR)) Log.error(message);
          inResolve && inResolve({ status: 400, send: message });
          return;
        }
        const { username } = body;
        if (!username) {
          const message = I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME);
          if (Log.will(Log.ERROR)) Log.error(message);
          inResolve && inResolve({ status: 400, send: message });
          return;
        }
        const userPath = `${AddAccount.userPath}${username}`;
        foundUser |= AddAccount.forgetUserByUserName(username);
        Files.deleteDirSync(userPath, true);

        foundUser |= this.deleteFromRegistry(username);
        this.deleteFromAuthenticationFile(username, foundUser, inResolve, inReject);
      } catch (error) {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_OPERATION_FAILED), Log.stringify(error));
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
      }
    });
  }

  deleteFromRegistry(username) {
    let foundUser = false;
    const accounts = Registry.get('Accounts');
    if (accounts && accounts.length) {
      for (let i = accounts.length - 1; i >= 0; i--) {
        if (username.toUpperCase() === accounts[i].username.toUpperCase()) {
          accounts.splice(i, 1);
          Registry.register(accounts, 'Accounts');
          foundUser = true;
          break;
        }
      }
    }
    return foundUser;
  }

  deleteFromAuthenticationFile(username, foundUser, inResolve, inReject) {
    let didFindUser = false;
    const writeSuccessCallback = () => {
      const message = I18n.get(Strings.SUCCESS_MESSAGE_ACCOUNT_DELETED);
      inResolve && inResolve({ status: 200, send: message });
    };
    const writeFailCallback = (error) => {
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_OPERATION_FAILED), Log.stringify(error));
      if (Log.will(Log.ERROR)) Log.error(message);
      inReject && inReject({ status: 500, send: message });
      didFindUser = true; // Turn off if statement, below.
    };
    const readSuccessCallback = (authenticationJSON) => {
      const authentication = JSON.parse(authenticationJSON);
      if (authentication && authentication.accounts && authentication.accounts.length) {
        for (let i = authentication.accounts.length - 1; i >= 0; i--) {
          if (username.toUpperCase() === authentication.accounts[i].username.toUpperCase()) {
            authentication.accounts.splice(i, 1);
            didFindUser = true;
            Files.writeFileLock(
              path.resolve(AddAccount.authenticationFile),
              JSON.stringify({ accounts: authentication.accounts }, null, 3),
              5,
              writeSuccessCallback,
              writeFailCallback,
            );
            break;
          }
        }
      }
      if (!didFindUser) {
        if (!foundUser) {
          const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_DOES_NOT_EXIST), 'Not Found');
          if (Log.will(Log.ERROR)) Log.error(message);
          inResolve && inResolve({ status: 404, send: message });
        } else {
          const message = I18n.get(Strings.SUCCESS_MESSAGE_ACCOUNT_DELETED);
          inResolve && inResolve({ status: 200, send: message });
        }
      }
    };
    const readFailCallback = (error) => {
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_OPERATION_FAILED), Log.stringify(error));
      if (Log.will(Log.ERROR)) Log.error(message);
      inReject && inReject({ status: 500, send: message });
    };

    Files.readFileLock(
      path.resolve(AddAccount.authenticationFile),
      5,
      readSuccessCallback,
      readFailCallback,
    );
  }
}
module.exports = DeleteAccount;
