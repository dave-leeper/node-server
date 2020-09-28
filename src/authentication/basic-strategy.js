const BasicStrategy = require('passport-http').Strategy;
const Registry = require('../util/registry');
const Strings = require('../util/strings');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const reduce = require('../util/algorithm').oneTruthyReduce;

const DEFAULT_EXPIRE_TIME = 300;
const WWW_AUTHENTICATE_HEADER = 'Basic realm="User Visible Realm", charset="UTF-8"';

class BasicStrategyJS {
  constructor() {
  }

  getAuthentication() {
    return new BasicStrategy((username, password, done) => {
      const operation = 'getAuthentication';
      const accounts = Registry.get('Accounts');
      if (!username || !password || !done) {
        const err = {
          operation, statusType: 'error', status: 401, message: I18n.get(Strings.ERROR_MESSAGE_LOGIN_REQUIRED),
        };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        return done && done(null, false, err);
      }
      if (!accounts) {
        const err = {
          operation, statusType: 'error', status: 501, message: I18n.get(Strings.ERROR_MESSAGE_AUTHENTICATION_NOT_CONFIGURED),
        };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        return done(null, false, err);
      }
      for (let loop = 0; loop < accounts.length; loop++) {
        const account = accounts[loop];
        if (account.username !== username) continue;
        if (account.password !== password) {
          const err = {
            operation, statusType: 'error', status: 401, message: I18n.get(Strings.ERROR_MESSAGE_INCORRECT_PASSWORD),
          };
          if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
          return done(null, false, err);
        }
        const headers = Registry.get('Headers');
        if (!headers.users) headers.users = {};
        if (!headers.users[account.username]) headers.users[account.username] = [];
        if (account.headers && account.headers.length != 0) {
          headers.users[account.username] = headers.users[account.username].concat(account.headers);
        }
        const token = btoa(`${username}:${password}`);
        headers.users[account.username].push({ header: 'Authorization', value: `Basic ${token}` });
        if (account.cookies && account.cookies.length != 0) {
          const cookies = Registry.get('Cookies');
          if (!cookies.users) cookies.users = {};
          if (!cookies.users[account.username]) cookies.users[account.username] = [];
          cookies.users[account.username] = cookies.users[account.username].concat(account.cookies);
        }
        account.token = token; // <------------ Used by getAuthorization()
        account.lastAccessTime = new Date(); // <------------ Used by getAuthorization()
        return done(null, {
          operation, statusType: 'success', status: 200, username: account.username, message: I18n.get(Strings.LOGIN_SUCCESSFUL),
        });
      }
      const err = {
        operation, statusType: 'error', status: 401, message: I18n.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), username),
      };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
      return done(null, false, err);
    });
  }

  getAuthorization() {
    return (req, res, next) => {
      const operation = 'getAuthorization';
      const config = Registry.get('ServerConfig');
      const accounts = Registry.get('Accounts');
      if ((!accounts)
                || (!req || !req.url)
                || (!config)) {
        const err = {
          operation, statusType: 'error', status: 501, message: I18n.get(Strings.ERROR_MESSAGE_AUTHORIZATION_NOT_CONFIGURED),
        };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        res.status(err.status);
        res.send(Log.stringify(err));
        return;
      }
      if (!req || !req.user || !req.user.username) {
        const err = {
          operation, statusType: 'error', status: 401, message: I18n.get(Strings.ERROR_MESSAGE_LOGIN_REQUIRED),
        };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        res.headers['WWW-Authenticate'] = WWW_AUTHENTICATE_HEADER;
        res.status(err.status);
        res.send(Log.stringify(err));
        return;
      }

      const { username } = req.user;
      const account = accounts.map((account) => (account.username === username ? account : null)).reduce(reduce);
      if (!account || !account.token) {
        const err = {
          operation, statusType: 'error', status: 401, message: I18n.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), username),
        };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        res.headers['WWW-Authenticate'] = WWW_AUTHENTICATE_HEADER;
        res.status(err.status);
        res.send(Log.stringify(err));
        return;
      }
      const authorizationHeader = req.headers.Authorization;
      const expectedToken = `Basic ${account.token}`;
      if (!authorizationHeader || expectedToken !== authorizationHeader) {
        const err = {
          operation, statusType: 'error', status: 403, message: I18n.get(Strings.ERROR_MESSAGE_UNAUTHORIZED),
        };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        res.status(err.status);
        res.send(Log.stringify(err));
        return;
      }
      const { url } = req;
      const verb = req.header('Request Method');
      const map = (configInfo) => {
        if (!configInfo.authorization) return null;
        if (configInfo.path !== url) return null;
        if (!verb) return null;
        if ((configInfo.verb) && (configInfo.verb.toUpperCase() !== verb.toUpperCase())) return null;
        if ((!configInfo.verb) && (verb.toUpperCase() !== 'GET')) return null;
        return configInfo.authorization;
      };
      let configInfo = null;
      if (config.statics) configInfo = config.statics.map(map).reduce(reduce);
      if (!configInfo && config.microservices) configInfo = config.microservices.map(map).reduce(reduce);
      if (!configInfo && config.endpoints) configInfo = config.endpoints.map(map).reduce(reduce);
      if (!configInfo && config.databaseConnections) {
        const mapDB = (configInfo) => {
          if (!configInfo.authorization) return null;
          if (!configInfo.name) return null;
          if (!url.startsWith(`/${configInfo.name}`)) return null;
          return configInfo.authorization;
        };
        configInfo = config.databaseConnections.map(mapDB).reduce(reduce);
      }
      if (!configInfo) return (next && next());
      const contains = (array, object) => {
        for (let loop = 0; loop < array.length; loop++) {
          if (array[loop] === object) return true;
        }
        return false;
      };
      const mapAuthorized = (userAuthGroup) => contains(configInfo.groups, userAuthGroup);
      const authorized = account.groups.map(mapAuthorized).reduce(reduce);
      if (!authorized) {
        const err = {
          operation, statusType: 'error', status: 403, message: I18n.get(Strings.ERROR_MESSAGE_UNAUTHORIZED),
        };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        res.status(err.status);
        res.send(Log.stringify(err));
        return;
      }
      if (this.hasExpired(account.lastAccessTime)) {
        const err = {
          operation, statusType: 'error', status: 401, message: I18n.get(Strings.ERROR_MESSAGE_LOGIN_EXPIRED),
        };
        const headers = Registry.get('Headers');
        if (headers && headers.users && headers.users[account.username]) this.arrayRemove(headers.users[account.username], 'Authorization');
        account.token = null;
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
        res.headers['WWW-Authenticate'] = WWW_AUTHENTICATE_HEADER;
        res.status(err.status);
        res.send(Log.stringify(err));
        return;
      }
      account.lastAccessTime = new Date();
      next && next();
    };
  }

  hasExpired(startDate) {
    if (!startDate) return true;
    let startTime = startDate.getTime();
    if (!startTime) return true;
    startTime /= 1000;
    const currentTime = new Date().getTime() / 1000;
    const config = Registry.get('ServerConfig');
    const expireTime = ((config && config.loginExpire) ? config.loginExpire : DEFAULT_EXPIRE_TIME);
    return currentTime - startTime >= expireTime;
  }

  arrayRemove(arr, value) {
    return arr.filter((ele) => ele != value);
  }
}

module.exports = BasicStrategyJS;
