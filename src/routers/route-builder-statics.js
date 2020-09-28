/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */

const path = require('path');
const ServiceBase = require('../util/service-base.js');
const Files = require('../util/files.js');
const Log = require('../util/log.js');

class RouteBuilderStatics extends ServiceBase {
  connect(router, config) {
    if (!router || !router.get || !router.put || !router.post || !router.patch || !router.delete || !router.options) return false;
    if (!config || !config.statics) return false;
    for (let loop1 = 0; loop1 < config.statics.length; loop1++) {
      const _static = config.statics[loop1];
      const verb = ((_static.verb) ? _static.verb.toUpperCase() : 'GET');
      const responseType = ((_static.responseType) ? _static.responseType.toString().toUpperCase() : '');
      const handlers = [];
      let handler;

      if (responseType === 'JSON') {
        if (typeof _static.response === 'string') {
          handler = this.buildJSONFileHandlerFromString(_static);
        } else if (Object.prototype.toString.call(_static.response) === '[object Array]') {
          if (typeof _static.response[0] === 'string') {
            handler = this.buildJSONFileHandlerFromArrayOfStrings(_static);
          } else if (typeof _static.response[0] === 'object') {
            handler = this.buildJSONHandlerFromArrayOfObjects(_static);
          }
        } else if ((_static.response) && (typeof _static.response === 'object')) {
          handler = this.buildJSONHandlerFromObject(_static);
        }
      } else if (responseType === 'HBS') {
        if (typeof _static.response === 'string') {
          handler = this.buildHandlebarsFileHandlerFromString(_static);
        } else if (Object.prototype.toString.call(_static.response) === '[object Array]') {
          handler = this.buildHandlebarsFileHandlerFromArrayOfStrings(_static);
        }
      } else if (responseType === 'BLOB') {
        if (typeof _static.response === 'string') {
          handler = this.buildBLOBFileHandlerFromString(_static);
        } else if (Object.prototype.toString.call(_static.response) === '[object Array]') {
          handler = this.buildBLOBFileHandlerFromArrayOfStrings(_static);
        }
      } else if (typeof _static.response === 'string') {
        handler = this.buildTextFileHandlerFromString(_static);
      } else if (Object.prototype.toString.call(_static.response) === '[object Array]') {
        if (typeof _static.response[0] === 'string') {
          handler = this.buildTextFileHandlerFromArrayOfStrings(_static);
        } else if (typeof _static.response[0] === 'object') {
          handler = this.buildTextHandlerFromArrayOfObjects(_static);
        }
      } else if ((_static.response) && (typeof _static.response === 'object')) {
        handler = this.buildTextHandlerFromObject(_static);
      }
      if (!handler) {
        if (Log.will(Log.ERROR)) {
          Log.error(`Handler not defined for static service ${_static.path}.`);
          continue;
        }
      }
      const loggingBegin = this.loggingBegin(_static);
      if (loggingBegin) handlers.push(loggingBegin);
      const authentication = this.authentication(config.authenticationStrategies, _static.authentication);
      if (authentication) handlers.push(authentication);
      const authorization = this.authorization(config.authenticationStrategies, _static.authorization);
      if (authorization) handlers.push(authorization);
      handlers.push(handler);
      const loggingEnd = this.loggingEnd(_static);
      if (loggingEnd) handlers.push(loggingEnd);
      handlers.push((req, res) => {});
      if (verb === 'GET') {
        router.get(_static.path, handlers);
      } else if (verb === 'PUT') {
        router.put(_static.path, handlers);
      } else if (verb === 'POST') {
        router.post(_static.path, handlers);
      } else if (verb === 'PATCH') {
        router.patch(_static.path, handlers);
      } else if (verb === 'DELETE') {
        router.delete(_static.path, handlers);
      } else if (verb === 'OPTIONS') {
        router.options(_static.path, handlers);
      }
    }
    return true;
  }

  buildJSONFileHandlerFromString(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      const responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response, req);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      const jsonResponseFileContents = Files.readFileSync(responseFile);
      JSON.parse(jsonResponseFileContents); // Parse JSON to make sure it's valid.

      res.send(jsonResponseFileContents);
      next && next();
    };
  }

  buildHandlebarsFileHandlerFromString(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      let responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response, req);
      responseFile = path.resolve('./src/views', responseFile);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      res.render(responseFile, _static.hbsData);
      next && next();
    };
  }

  buildTextFileHandlerFromString(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      const responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response, req);
      Log.trace(`Response File: ${responseFile}`);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      const textResponseFileContents = Files.readFileSync(responseFile, _static.encoding);
      res.send(textResponseFileContents);
      next && next();
    };
  }

  buildBLOBFileHandlerFromString(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      const responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response, req);
      Log.trace(`Sending file: ${responseFile}.`);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      res.sendFile(responseFile, { root: path.resolve(__dirname, '../..') });
      next && next();
    };
  }

  buildJSONFileHandlerFromArrayOfStrings(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      const index = RouteBuilderStatics.getIndex(_static);
      const responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response[index], req);

      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      const jsonResponseFileContents = Files.readFileSync(responseFile, _static.encoding);
      JSON.parse(jsonResponseFileContents); // Check for valid JSON
      res.send(jsonResponseFileContents);
      RouteBuilderStatics.incrementIndex(_static, index);
      next && next();
    };
  }

  buildHandlebarsFileHandlerFromArrayOfStrings(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      const index = RouteBuilderStatics.getIndex(_static);
      const responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response[index], req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      res.render(responseFile, _static.hbsData[index]);
      RouteBuilderStatics.incrementIndex(_static, index);
      next && next();
    };
  }

  buildTextFileHandlerFromArrayOfStrings(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      const index = RouteBuilderStatics.getIndex(_static);
      const responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response[index], req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      const textResponseFileContents = Files.readFileSync(responseFile, _static.encoding);

      res.send(textResponseFileContents);
      RouteBuilderStatics.incrementIndex(_static, index);
      next && next();
    };
  }

  buildBLOBFileHandlerFromArrayOfStrings(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      const index = RouteBuilderStatics.getIndex(_static);
      const responseFile = RouteBuilderStatics.replaceResponseParamsWithRequestValues(_static.response[index], req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);
      if (!RouteBuilderStatics.fileExists(responseFile, res)) return next && next();

      res.sendFile(responseFile);
      RouteBuilderStatics.incrementIndex(_static, index);
      next && next();
    };
  }

  buildJSONHandlerFromObject(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);

      const jsonResponse = JSON.stringify(_static.response);
      JSON.parse(jsonResponse); // Check for valid JSON
      res.send(jsonResponse);
      next && next();
    };
  }

  buildTextHandlerFromObject(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);

      const textResponse = ((_static.response.text) ? _static.response.text : JSON.stringify(_static.response));

      res.send(textResponse);
      next && next();
    };
  }

  buildJSONHandlerFromArrayOfObjects(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      const index = RouteBuilderStatics.getIndex(_static);

      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);

      const jsonResponse = JSON.stringify(_static.response[index]);
      JSON.parse(jsonResponse); // Check for valid JSON
      res.send(jsonResponse);
      RouteBuilderStatics.incrementIndex(_static, index);
      next && next();
    };
  }

  buildTextHandlerFromArrayOfObjects(_static) {
    return (req, res, next) => {
      RouteBuilderStatics.logStaticRequest(_static, req);
      const index = RouteBuilderStatics.getIndex(_static);

      this.addHeaders(_static, req, res);
      this.addCookies(_static, req, res);

      const textResponse = ((_static.response[index].text) ? _static.response[index].text : JSON.stringify(_static.response[index]));

      res.send(textResponse);
      RouteBuilderStatics.incrementIndex(_static, index);
      next && next();
    };
  }

  static getIndex(_static) {
    if (!_static.indexes) _static.indexes = {};
    if (!_static.indexes[_static.path]) {
      _static.indexes[_static.path] = {};
    }
    if (!_static.indexes[_static.path].___index) {
      _static.indexes[_static.path].___index = 0;
    }

    return _static.indexes[_static.path].___index;
  }

  static incrementIndex(_static) {
    let index = RouteBuilderStatics.getIndex(_static);
    index++;
    if (_static.response.length <= index) index = 0; // loop back to start
    _static.indexes[_static.path].___index = index;
  }

  static replaceResponseParamsWithRequestValues(responseValue, httpRequestObject) {
    let finalResponse = responseValue;
    let paramIndex = finalResponse.indexOf(':');
    while (paramIndex !== -1) {
      let param = finalResponse.substr(paramIndex + 1);
      if ((param.indexOf('/') !== -1)) param = param.substring(0, param.indexOf('/'));
      const responseFront = finalResponse.substr(0, paramIndex);
      const responseBack = finalResponse.substr(paramIndex + param.length + 1);
      finalResponse = responseFront + httpRequestObject.params[param] + responseBack;
      paramIndex = finalResponse.indexOf(':');
    }
    return finalResponse;
  }

  static logStaticRequest(_static, req) {
    if (Log.will(Log.TRACE)) Log.trace(`Received request for static service at ${(_static.verb) ? _static.verb : 'GET'} ${_static.path}`);
  }

  static fileExists(responseFile, res) {
    if (Files.existsSync(responseFile)) return true;
    const error = {
      title: responseFile,
      message: `File Not Found: ${responseFile}.`,
      error: { status: 404 },
    };
    res.status(404);
    res.render('error', error);
    return false;
  }
}

module.exports = RouteBuilderStatics;
