/* eslint-disable radix */

const Registry = require('./registry.js');
const Strings = require('./strings.js');
const I18n = require('./i18n.js');
const Log = require('./log.js');

class ServiceBase {
  constructor() {
    this.storedLoggingLevel = [];
  }

  notFoundResponse(req, res) {
    const originalURL = ((req && req.originalUrl) ? req.originalUrl : undefined);
    const error = {
      title: 'Not Found',
      message: 'File Not Found.',
      error: { status: 404 },
      requestURL: originalURL,
    };
    res && res.render('error', error);
  }

  addHeaders(configInfo, req, res) {
    if ((configInfo) && (configInfo.headers) && (configInfo.headers.length)) {
      for (let loop = 0; loop < configInfo.headers.length; loop++) {
        const header = configInfo.headers[loop];
        res.header(header.header, header.value);
      }
      Log.all(`Added headers: ${Log.stringify(configInfo.headers)}`);
    }
    if (!req || !req.user || !req.user.username) return;
    const headers = Registry.get('Headers');
    if (!headers || !headers.users) return;
    const userHeaders = headers.users[req.user.username];
    if (!userHeaders) return;
    for (let loop = 0; loop < userHeaders.length; loop++) {
      const header = userHeaders[loop];
      res.header(header.header, header.value);
    }
    Log.all(`Added headers for user: ${req.user.username}`);
  }

  addCookies(configInfo, req, res) {
    const createCookie = (cookieInfo) => {
      const cookie = { name: cookieInfo.name, value: cookieInfo.value };
      let age = null;
      if (cookieInfo.expires) {
        const offset = parseInt(cookieInfo.expires);
        const expireTime = new Date(Number(new Date()) + offset);
        age = { expires: expireTime };
      } else if (cookieInfo.maxAge) {
        age = { maxAge: parseInt(cookieInfo.maxAge) };
      }
      if (!age) res.cookie(cookie.name, cookie.value);
      else res.cookie(cookie.name, cookie.value, age);
    };
    if ((configInfo) && (configInfo.cookies) && (configInfo.cookies.length)) {
      for (let loop = 0; loop < configInfo.cookies.length; loop++) {
        createCookie(configInfo.cookies[loop]);
      }
      Log.all(`Added cookies: ${Log.stringify(configInfo.cookies)}`);
    }
    if (!req || !req.user || !req.user.username) return;
    const cookies = Registry.get('Cookies');
    if (!cookies || !cookies.users) return;
    const userCookies = cookies.users[req.user.username];
    if (!userCookies) return;
    for (let loop = 0; loop < userCookies.length; loop++) {
      createCookie(userCookies[loop]);
    }
    Log.all(`Added cookies for user: ${req.user.username}`);
  }

  sendErrorResponse(error, res, status) {
    res && res.status(((status) || 500));
    res && res.render('error', error);
  }

  authentication(authenticationStrategies, authenticationName) {
    if (!authenticationStrategies || !authenticationName) return null;
    const passport = Registry.get('Passport');
    const authenticationStrategy = authenticationStrategies[authenticationName];
    if (!passport || !authenticationStrategy) {
      if (Log.will(Log.ERROR)) Log.error(I18n.get(Strings.ERROR_MESSAGE_AUTHENTICATION_NOT_CONFIGURED));
      return null;
    }
    let strategyHandler;
    if (!authenticationStrategy.config) strategyHandler = passport.authenticate(authenticationStrategy.name);
    else strategyHandler = passport.authenticate(authenticationStrategy.name, authenticationStrategy.config);
    return strategyHandler;
  }

  authorization(authorizationStrategies, authorizationInfo) {
    if (!authorizationStrategies || !authorizationInfo || !authorizationInfo.strategy) return null;
    const authorizationStrategy = authorizationStrategies[authorizationInfo.strategy];
    if (!authorizationStrategy || !authorizationStrategy.strategy || !authorizationStrategy.strategy.getAuthorization) {
      if (Log.will(Log.ERROR)) Log.error(I18n.get(Strings.ERROR_MESSAGE_AUTHORIZATION_NOT_CONFIGURED));
      return null;
    }
    return authorizationStrategy.strategy.getAuthorization();
  }

  loggingBegin(configInfo) {
    if (!configInfo || !configInfo.logging) return null;
    return (req, res, next) => {
      this.storedLoggingLevel.unshift(Log.level);
      Log.level = Log.getLevelFromString(configInfo.logging);
    };
  }

  loggingEnd(configInfo) {
    if (!configInfo || !configInfo.logging) return null;
    return (req, res, next) => {
      Log.level = this.storedLoggingLevel.shift();
    };
  }
}

module.exports = ServiceBase;
