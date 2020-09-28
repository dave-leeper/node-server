/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const path = require('path');
const ServiceBase = require('../util/service-base.js');
const Log = require('../util/log.js');

class RouteBuilderEndpoints extends ServiceBase {
  connect(router, config) {
    if (!router || !router.get || !router.put || !router.post || !router.patch || !router.delete || !router.options) return false;
    if (!config || !config.endpoints) return false;
    for (let loop2 = 0; loop2 < config.endpoints.length; loop2++) {
      const endpoint = config.endpoints[loop2];
      const verb = ((endpoint.verb) ? endpoint.verb.toUpperCase() : 'GET');
      const endpointPath = path.resolve('./src/endpoints', endpoint.serviceFile);
      const endpointClass = require(endpointPath);
      // eslint-disable-next-line new-cap
      const end = new endpointClass(endpoint);
      const handlers = [];

      if (!end.do) {
        if (Log.will(Log.ERROR)) {
          Log.error(`Handler not defined for endpoint ${endpoint.path}.`);
          continue;
        }
      }
      const loggingBegin = this.loggingBegin(endpoint);
      if (loggingBegin) handlers.push(loggingBegin);
      const authentication = this.authentication(config.authenticationStrategies, endpoint.authentication);
      if (authentication) handlers.push(authentication);
      const authorization = this.authorization(config.authenticationStrategies, endpoint.authorization);
      if (authorization) handlers.push(authorization);
      handlers.push((req, res, next) => { end.do(req, res, next); });
      const loggingEnd = this.loggingEnd(endpoint);
      if (loggingEnd) handlers.push(loggingEnd);
      handlers.push((req, res) => {});
      if (verb === 'GET') {
        router.get(endpoint.path, handlers);
      } else if (verb === 'PUT') {
        router.put(endpoint.path, handlers);
      } else if (verb === 'POST') {
        router.post(endpoint.path, handlers);
      } else if (verb === 'PATCH') {
        router.patch(endpoint.path, handlers);
      } else if (verb === 'DELETE') {
        router.delete(endpoint.path, handlers);
      } else if (verb === 'OPTIONS') {
        router.options(endpoint.path, handlers);
      }
    }
    return true;
  }
}

module.exports = RouteBuilderEndpoints;
