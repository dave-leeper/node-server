const Log = require('../util/log');
const Registry = require('../util/registry');

class Endpoints {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const serverConfig = Registry.get('ServerConfig');
      if ((!serverConfig) || (!serverConfig.endpoints)) {
        const error = 'Error looking up endpoints.';
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject({ status: 500, send: error });
        return;
      }
      if (serverConfig.endpoints.length === 0) {
        inResolve && inResolve({ status: 200, send: 'There are no endpoints.' });
        return;
      }
      const result = [];
      const { endpoints } = serverConfig;
      for (let loop = 0; loop < endpoints.length; loop++) {
        const service = endpoints[loop];
        result.push({
          name: service.name,
          path: service.path,
          description: service.description,
        });
      }
      inResolve && inResolve({ status: 200, send: Log.stringify(result) });
    });
  }
}
module.exports = Endpoints;
