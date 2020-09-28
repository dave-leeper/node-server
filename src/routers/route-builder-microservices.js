/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

// https://italonascimento.github.io/applying-a-timeout-to-your-promises/
const path = require('path');
const files = require('../util/files.js');
const ServiceBase = require('../util/service-base.js');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class RouteBuilderMicroservices extends ServiceBase {
  connect(router, config) {
    if (!router || !router.get || !router.put || !router.post || !router.patch || !router.delete || !router.options) return false;
    if (!config || !config.microservices) return false;
    for (let loop2 = 0; loop2 < config.microservices.length; loop2++) {
      const microserviceConfig = config.microservices[loop2];
      const verb = ((microserviceConfig.verb) ? microserviceConfig.verb.toUpperCase() : 'GET');
      const handlers = [];
      const handler = this.buildHandler(microserviceConfig);

      if (!handler) {
        if (Log.will(Log.ERROR)) {
          Log.error(`Handler not defined for microservice ${microserviceConfig.path}.`);
          continue;
        }
      }

      const loggingBegin = this.loggingBegin(microserviceConfig);
      if (loggingBegin) handlers.push(loggingBegin);
      const authentication = this.authentication(config.authenticationStrategies, microserviceConfig.authentication, microserviceConfig);
      if (authentication) handlers.push(authentication);
      const authorization = this.authorization(config.authenticationStrategies, microserviceConfig.authorization, microserviceConfig);
      if (authorization) handlers.push(authorization);
      handlers.push(handler);
      const loggingEnd = this.loggingEnd(microserviceConfig);
      if (loggingEnd) handlers.push(loggingEnd);
      handlers.push((req, res) => {});
      if (verb === 'GET') {
        router.get(microserviceConfig.path, handlers);
      } else if (verb === 'PUT') {
        router.put(microserviceConfig.path, handlers);
      } else if (verb === 'POST') {
        router.post(microserviceConfig.path, handlers);
      } else if (verb === 'PATCH') {
        router.patch(microserviceConfig.path, handlers);
      } else if (verb === 'DELETE') {
        router.delete(microserviceConfig.path, handlers);
      } else if (verb === 'OPTIONS') {
        router.options(microserviceConfig.path, handlers);
      }
    }
    return true;
  }

  buildHandler(microserviceConfig) {
    const handler = (req, res, next) => {
      const microservicePath = path.resolve('./src/microservices', microserviceConfig.serviceFile);
      const microserviceClass = require(microservicePath);
      // eslint-disable-next-line new-cap
      const micro = new microserviceClass(microserviceConfig);
      let timeoutId;
      const params = {
        serviceInfo: microserviceConfig,
        body: req.body,
        params: req.params,
        query: req.query,
        files: req.files,
        headers: req.headers,
        cookies: req.cookies,
        pipe: req.pipe,
        busboy: req.busboy,
        clientIp: req.clientIp,
      };
      const successFunc = (data) => {
        clearTimeout(timeoutId);
        Log.trace(`${microserviceConfig.name} executed successfully.`);
        if (data && data.status) {
          res.status(data.status);
        }
        else {
          res.status(200);
        }
        if (data.send) {
          if (Array.isArray(data.send)) {
            res.send(data.send.map((x) => x));
          } else {
            res.send(data.send);
          }
        } else if (data.fileDownloadPath) {
          res.download(data.fileDownloadPath);
          if (data.fileDeleteAfterDownload) {
            files.deleteSync(data.fileDownloadPath);
          }
        } else if (data.viewName) {
          res.render(data.viewName, data.viewObject);
        }
        next && next();
      };
      const errorFunc = (error) => {
        clearTimeout(timeoutId);
        Log.trace(`${microserviceConfig.name} executed with error(s). ${Log.stringify(error)}`);
        if (error && error.status) {
          res.status(error.status);
        } else {
          res.status(500);
        }
        if (error.send) {
          if (Array.isArray(error.send)) {
            Log.error(error.send.map((x) => x));
          } else if (Log.will(Log.ERROR)) {
            Log.error(error.send);
          }
          if (!error.fileDownloadPath && !error.viewName) {
            if (Array.isArray(error.send)) {
              res.send(error.send.map((x) => x));
            } else {
              res.send(error.send);
            }
          }
        } else if (error.fileDownloadPath) {
          res.download(error.fileDownloadPath);
        } else if (error.viewName) {
          res.render(error.viewName, error.viewObject);
        }
        next && next();
      };
      const MICROSERVICE_TIMEOUT = (microserviceConfig.timeout) ? microserviceConfig.timeout : 20000;
      const promiseTimeout = (ms, promise) => {
        // Create a promise that rejects in <ms> milliseconds
        const timeout = new Promise((inResolve, inReject) => {
          timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_MICROSERVICE_TIMED_OUT), microserviceConfig.name, MICROSERVICE_TIMEOUT);
            if (Log.will(Log.ERROR)) Log.error(message);
            inReject && inReject({ status: 408, send: message });
          }, ms);
        });

        // Returns a race between our timeout and the passed in promise
        return Promise.race([
          promise,
          timeout,
        ]);
      };

      try {
        Log.trace(`Executing ${microserviceConfig.name} microservice.`);
        this.addHeaders(microserviceConfig, req, res);
        this.addCookies(microserviceConfig, req, res);
        promiseTimeout(MICROSERVICE_TIMEOUT, micro.do(params))
          .then(successFunc)
          .catch(errorFunc);
      } catch (err) {
        const error = `Error executing microservice ${microserviceConfig.name}.`;
        if (Log.will(Log.ERROR)) Log.error(`${error} Error: ${Log.stringify(err)}`);
        res.status(500);
        res.render('error', { message: error, error: { status: 500, stack: err.stack } });
        res.end();
        next && next();
      }
    };
    return handler;
  }
}

module.exports = RouteBuilderMicroservices;
