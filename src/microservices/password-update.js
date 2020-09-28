const nodemailer = require('nodemailer');
const path = require('path');
const Encrypt = require('../util/encrypt');
const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Registry = require('../util/registry');
const Strings = require('../util/strings');
const AddAccount = require('./add-account');

class PasswordUpdate {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const { body } = reqInfo;
      if (!body.password || !body.reenterPassword || body.password !== body.reenterPassword) {
        const message = I18n.get(Strings.ERROR_MESSAGE_INCORRECT_PASSWORD);
        if (Log.will(Log.ERROR)) Log.error(message);
        inResolve && inResolve({ status: 400, send: message });
        return;
      }
      if (!body.token) {
        const message = I18n.get(Strings.ERROR_MESSAGE_UNAUTHORIZED);
        if (Log.will(Log.ERROR)) Log.error(message);
        inResolve && inResolve({ status: 403, send: message });
        return;
      }
      const crypto = Registry.get('Crypto');
      if (!crypto) {
        const message = I18n.get(Strings.ERROR_MESSAGE_ENCRYPTION_ERROR);
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 503, send: message });
        return;
      }

      let user;
      const now = Date.now();
      const accounts = Registry.get('Accounts');

      for (let i = accounts.length - 1; i >= 0; i--) {
        if (accounts[i].resetPasswordToken
        && accounts[i].resetPasswordExpires
        && body.token === accounts[i].resetPasswordToken
        && now < accounts[i].resetPasswordExpires) {
          user = accounts[i];
          user.password = body.password;
          accounts[i] = Encrypt.encryptAccount(user, crypto.iv, crypto.key);
          break;
        }
      }
      if (!user) {
        const message = I18n.get(Strings.ERROR_MESSAGE_INVALID_RESET_TOKEN);
        if (Log.will(Log.ERROR)) Log.error(message);
        inResolve && inResolve({ status: 404, send: message });
        return;
      }

      const successCallback = () => {
        const message = I18n.get(Strings.SUCCESS_MESSAGE_ACCOUNT_UPDATED);
        const emailPassword = Encrypt.decrypt('7ecdd8cc6be5dc4feb615b9545894472', crypto.iv, crypto.key);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'magicjtv@gmail.com',
            pass: emailPassword,
          },
        });
        const msg = {
          to: user.email,
          from: 'magicjtv@gmail.com',
          subject: 'Password Reset Complete',
          text: 'Your password for your Hero account was successfully updated.\n',
        };
        transporter.sendMail(msg, (error, data) => {
          if (error) {
            if (Log.will(Log.ERROR)) Log.error(error);
            const message2 = Strings.format(I18n.get(Strings.ERROR_MESSAGE_SEND_EMAIL_FAILED), error);
            if (Log.will(Log.ERROR)) Log.error(message2);
            inReject && inReject({ status: 500, send: message2 });
            return;
          }
          const decryptedAccounts = Encrypt.decryptAccounts(accounts, crypto.iv, crypto.key);
          Registry.register(decryptedAccounts, 'Accounts');
          inResolve && inResolve({ status: 200, send: message });
        });
      };
      const failCallback = (error) => {
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_ADD_FAILED), Log.stringify(error));
        if (Log.will(Log.ERROR)) Log.error(message);
        inReject && inReject({ status: 500, send: message });
      };
      Files.writeFileLock(
        path.resolve(AddAccount.authenticationFile),
        JSON.stringify({ accounts }, null, 3),
        5,
        successCallback,
        failCallback,
      );
    });
  }
}
module.exports = PasswordUpdate;
