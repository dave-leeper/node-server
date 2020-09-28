const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const http = require('http');
const https = require('https');
const passport = require('passport');
const path = require('path');
const requestIp = require('request-ip');
const session = require('express-session');

const RouteBuilder = require('./src/routers/route-builder');
const Strings = require('./src/util/strings');
const I18n = require('./src/util/i18n');
const Log = require('./src/util/log');
const Registry = require('./src/util/registry');
const FileUtilities = require('./src/util/files.js');
const Encrypt = require('./src/util/encrypt');
let { accounts } = require('./private/users/authentication');

/**
 * @constructor
 */
class Server {
  constructor() {
    this.express = null;
    this.server = null;
    this.router = null;
  }

  init(port, config, callback) {
    const locals = {
      port,
    };
    const getConfigFileNames = (config) => {
      const configList = FileUtilities.getFileList(config, /.json/i, true, false);
      if (!configList) [];
      for (let loop = 0; loop < configList.length; loop++) {
        const fullPath = path.join(__dirname, path.join(config, configList[loop]));
        configList[loop] = fullPath;
      }
      return configList;
    };
    const loadConfigs = (configFileNames) => {
      const loadedConfigs = [];
      for (let loop = 0; loop < configFileNames.length; loop++) {
        loadedConfigs.push(require(configFileNames[loop]));
      }
      return loadedConfigs;
    };
    const mergeConfigs = (loadedConfigs) => {
      const mergedConfig = {};
      for (let loop = 0; loop < loadedConfigs.length; loop++) {
        const config = loadedConfigs[loop];
        // Only first logging configure is used
        if (config.logging && !mergedConfig.logging) mergedConfig.logging = config.logging;
        if (config.port) mergedConfig.port = config.port;
        if (config.https) mergedConfig.https = config.https;
        if (config.statics) {
          if (!mergedConfig.statics) mergedConfig.statics = [];
          mergedConfig.statics = mergedConfig.statics.concat(config.statics);
        }
        if (config.authentication) {
          if (!mergedConfig.authentication) mergedConfig.authentication = [];
          mergedConfig.authentication = mergedConfig.authentication.concat(config.authentication);
        }
        if (config.microservices) {
          if (!mergedConfig.microservices) mergedConfig.microservices = [];
          mergedConfig.microservices = mergedConfig.microservices.concat(config.microservices);
        }
        if (config.endpoints) {
          if (!mergedConfig.endpoints) mergedConfig.endpoints = [];
          mergedConfig.endpoints = mergedConfig.endpoints.concat(config.endpoints);
        }
        if (config.databaseConnections) {
          if (!mergedConfig.databaseConnections) mergedConfig.databaseConnections = [];
          mergedConfig.databaseConnections = mergedConfig.databaseConnections.concat(config.databaseConnections);
        }
      }
      return mergedConfig;
    };
    let serverConfig = config;
    const crypto = this.initCrypto();
    accounts = Encrypt.decryptAccounts(accounts, crypto.iv, crypto.key);
    if (typeof config === 'string') serverConfig = mergeConfigs(loadConfigs(getConfigFileNames(config)));

    this.express = express();
    Registry.register(new Date(), 'ServerStartTime');
    Registry.register(this, 'Server');
    Registry.register(serverConfig, 'ServerConfig');
    Registry.register({ users: { } }, 'Headers');
    Registry.register({ users: { } }, 'Cookies');

    Registry.register(accounts, 'Accounts');

    // Logger setup
    if (serverConfig.logging) Log.configure(serverConfig.logging);
    Log.trace(Log.stringify(serverConfig));

    // Override
    if (serverConfig.port) locals.port = serverConfig.port;

    // view engine setup
    this.express.set('views', path.join(__dirname, 'src', 'views'));
    this.express.set('view engine', 'hbs');

    this.express.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    this.express.use(bodyParser.json());
    this.express.use(session({ secret: 'cats', resave: true, saveUninitialized: true }));
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(cookieParser());
    this.express.use(express.static(path.join(__dirname, 'public')));
    this.express.use(fileUpload());
    this.express.use(passport.initialize());
    this.express.use(passport.session());
    this.express.use(requestIp.mw());
    this.express.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Methods', 'GET PUT POST DELETE OPTIONS');
      res.header('Access-Control-Max-Age', '86400');
      res.status(200);
      next();
    });
    passport.serializeUser((user, done) => { done(null, user); });
    passport.deserializeUser((user, done) => { done(null, user); });
    Registry.register(passport, 'Passport');

    this.useRouter(this.createRouter(serverConfig));

    // catch 404 and forward to error handler
    this.express.use((req, res, next) => {
      const err = new Error(`Not Found: ${req.url}`);
      err.status = 404;
      next(err);
    });

    // error handler
    this.express.use((err, req, res, next) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    const normalizedPort = this.normalizePort(locals.port);
    this.express.set('port', normalizedPort);
    Registry.register(locals.port, 'Port');

    if (serverConfig.https) {
      const privateKey = fs.readFileSync('./key.pem', 'utf8');
      const certificate = fs.readFileSync('./cert.pem', 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      const httpsServer = https.createServer(credentials, this.express);
      this.server = httpsServer.listen(normalizedPort, null, null, callback);
    } else {
      const httpServer = http.createServer(this.express);
      this.server = httpServer.listen(normalizedPort, null, null, callback);
    }
    this.server.on('error', this.onError);

    Log.info(Strings.format(I18n.get(Strings.LISTENING_ON_PORT), normalizedPort));

    return this;
  }

  stop(callback) {
    try {
      const databaseConnectorManager = Registry.get('DatabaseConnectorManager');
      if (databaseConnectorManager) {
        databaseConnectorManager.disconnect();
      }
    } catch (err) {
      Log.error(`Error shutting down database connections. Error: ${Log.stringify(err)}`);
    }
    this.server.close(callback);
    this.router = null;
  }

  createRouter(serverConfig) {
    const router = express.Router();
    return RouteBuilder.connect(router, serverConfig);
  }

  useRouter(router) {
    if (!this.router) {
      this.express.use('/', (req, res, next) => {
        this.router(req, res, next);
      });
    }
    this.router = router;
  }

  /**
     * Normalize a port into a number, string, or false.
     * @param val {Object} The port number or pipe.
     */
  normalizePort(val) {
    const port = parseInt(val, 10);
    // named pipe
    if (isNaN(port)) return val;
    // port number
    if (port >= 0) return port;
    return false;
  }

  onError(error) {
    Log.error(Log.stringify(error));
  }

  initCrypto() {
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const Encrypt = require('./src/util/encrypt');
    let token = Encrypt.encrypt('d391afcab14db918ee41067cdd777007dda89274', crypto.iv, crypto.key);
    // console.log(`Token: ${token}`);
    token = Encrypt.decrypt(token, crypto.iv, crypto.key);
    // console.log(`Token: ${token}`);

    return crypto;
  }
}

module.exports = Server;
