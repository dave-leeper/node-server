/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
// https://github.com/pbojinov/request-ip
const path = require('path');
const Encrypt = require('../util/encrypt');
const Files = require('../util/files');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Registry = require('../util/registry');
const Strings = require('../util/strings');

class AddAccount {
  static get userPath() { return './private/users/'; }

  static get machinesPath() { return './private/machines/'; }

  static get authenticationFile() { return './private/users/authentication.json'; }

  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      console.log(`--------------> 0 ${JSON.stringify(reqInfo)}`);
      const { body } = reqInfo;
      console.log(`--------------> 1 ${JSON.stringify(body)}`);
      const accounts = Registry.get('Accounts');
      console.log(`--------------> 2 ${JSON.stringify(accounts)}`);
      const newAccount = this.buildAccount(body);
      console.log(`--------------> 3 ${JSON.stringify(newAccount)}`);
      const validateResult = this.validate(body, newAccount, accounts);
      if (validateResult.status !== 200) {
        if (Log.will(Log.ERROR)) Log.error(validateResult.send);
        if (validateResult.status < 400 || validateResult.status > 499) {
          inReject && inReject(validateResult);
        } else {
          inResolve && inResolve(validateResult);
        }
        return;
      }

      console.log('--------------> 4');
      const updateResult = this.updateAccounts(newAccount, accounts, inResolve, inReject);
      if (updateResult.status) {
        console.log('--------------> 5');
        AddAccount.rememberUser(reqInfo, newAccount.username);
        this.writeAccount(newAccount, AddAccount.authenticationFile, updateResult.accounts, inResolve, inReject);
      }
    });
  }

  validate(body, account, accounts) {
    if (!body.username) return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), body.username) };
    if (!body.password) return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_PASSWORD), body.username) };
    if (!body.group1 && !body.group2 && !body.group3) return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_GROUP), body.username) };
    const emailStatus = this.validateEmail(body, account, accounts);
    if (emailStatus.status !== 200) return emailStatus;
    return this.validateDatabase(body);
  }

  validateEmail(body, account, accounts) {
    if (!body.email || body.email.length < 5 || body.email.indexOf('@') === -1 || body.email.indexOf('.') === -1) return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_EMAIL), body.email) };
    for (let i = 0; i < accounts.length; i++) {
      if (body.email === accounts[i].email) return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_EMAIL), body.email) };
    }
    return { status: 200 };
  }

  validateDatabase(body) {
    if (Files.existsSync(path.resolve(AddAccount.userPath + body.username))) return { status: 400, send: Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_ALREADY_EXISTS), body.username) };
    return { status: 200 };
  }

  buildAccount(body) {
    const newAccount = {
      username: body.username,
      password: body.password,
      groups: [],
    };
    if (body.group1) newAccount.groups.push(body.group1);
    if (body.group2) newAccount.groups.push(body.group2);
    if (body.group3) newAccount.groups.push(body.group3);
    if (body.headername1 || body.headername2 || body.headername3) {
      newAccount.headers = [];
      if (body.headername1) newAccount.headers.push({ header: body.headername1, value: body.headervalue1 });
      if (body.headername2) newAccount.headers.push({ header: body.headername2, value: body.headervalue2 });
      if (body.headername3) newAccount.headers.push({ header: body.headername3, value: body.headervalue3 });
    }
    if (body.cookiename1 || body.cookiename2 || body.cookiename3) {
      newAccount.cookies = [];
      if (body.cookiename1) newAccount.cookies.push(this.makeCookie(body.cookiename1, body.cookievalue1, body.cookieepires1, body.cookiemaxage1));
      if (body.cookiename2) newAccount.cookies.push(this.makeCookie(body.cookiename2, body.cookievalue2, body.cookieepires2, body.cookiemaxage2));
      if (body.cookiename3) newAccount.cookies.push(this.makeCookie(body.cookiename3, body.cookievalue3, body.cookieepires3, body.cookiemaxage3));
    }
    if (body.email) newAccount.email = body.email;
    if (body.firstName) newAccount.firstName = body.firstName;
    if (body.lastName) newAccount.lastName = body.lastName;
    const now = new Date();
    const transactionDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    newAccount.transactionDate = transactionDate;
    return newAccount;
  }

  updateAccounts(newAccount, accounts, inResolve, inReject) {
    if (accounts && accounts.length) {
      for (let i = accounts.length - 1; i >= 0; i--) {
        if (newAccount.username.toUpperCase() === accounts[i].username.toUpperCase()) {
          const message = I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_ALREADY_EXISTS);
          if (Log.will(Log.ERROR)) Log.error(message);
          inResolve && inResolve({ status: 400, send: message });
          return { status: false };
        }
      }
      accounts.push(newAccount);
    } else {
      accounts = [newAccount];
    }
    return { status: true, accounts };
  }

  writeAccount(newAccount, authenticationFile, accounts, inResolve, inReject) {
    const newUserPath = path.resolve(AddAccount.userPath + newAccount.username);

    const successCallback = () => {
      const message = I18n.get(Strings.SUCCESS_MESSAGE_ACCOUNT_ADDED);
      Files.createDirSync(newUserPath);
      Files.writeFileSync(`${newUserPath}/owned.json`, '[]');
      Files.writeFileSync(`${newUserPath}/favorites.json`, '[]');
      Files.writeFileSync(`${newUserPath}/cart.json`, '[]');
      Files.writeFileSync(`${newUserPath}/hero-base.json`, '[]');
      Registry.unregister('Accounts');
      Registry.register(accounts, 'Accounts');
      inResolve && inResolve({ status: 200, send: message });
    };
    const failCallback = (error) => {
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_ACCOUNT_OPERATION_FAILED), Log.stringify(error));
      if (Log.will(Log.ERROR)) Log.error(message);
      inReject && inReject({ status: 500, send: message });
    };
    const crypto = Registry.get('Crypto');
    const encryptedAccounts = Encrypt.encryptAccounts(accounts, crypto.iv, crypto.key);
    Files.writeFileLock(
      path.resolve(authenticationFile),
      JSON.stringify({ accounts: encryptedAccounts }, null, 3),
      5,
      successCallback,
      failCallback,
    );
  }

  makeCookie(name, value, expires, maxAge) {
    const cookie = { name, value };
    if (expires) cookie.expires = expires;
    if (maxAge) cookie.maxAge = maxAge;
    return cookie;
  }

  static rememberUser(reqInfo, username) {
    if (!username) return;
    if (!reqInfo.body.rememberMe) return;
    const machine = reqInfo.clientIp;
    const record = { machine, username };
    const machinesFile = path.resolve(`${AddAccount.machinesPath}machines.json`);
    const machinesData = require(machinesFile);
    machinesData.push(record);
    Files.writeFileSync(machinesFile, JSON.stringify(machinesData));
  }

  static forgetUser(params, username) {
    if (!username) return;
    const machine = params.req.clientIp;
    const record = { machine, username };
    const machinesFile = path.resolve(`${AddAccount.machinesPath}machines.json`);
    const machinesData = require(machinesFile);
    for (let i = machinesData.length - 1; i >= 0; i--) {
      const md = machinesData[i];
      if (md.machine === record.machine) {
        machinesData.splice(i, 1);
        Files.writeFileSync(machinesFile, JSON.stringify(machinesData));
        return;
      }
    }
  }

  static forgetUserByUserName(username) {
    if (!username) return false;
    const machinesFile = path.resolve(`${AddAccount.machinesPath}machines.json`);
    const machinesData = require(machinesFile);
    let foundUser = false;
    for (let i = machinesData.length - 1; i >= 0; i--) {
      const md = machinesData[i];
      if (md.username === username) {
        machinesData.splice(i, 1);
        foundUser = true;
      }
    }
    Files.writeFileSync(machinesFile, JSON.stringify(machinesData));
    return foundUser;
  }
}
module.exports = AddAccount;
