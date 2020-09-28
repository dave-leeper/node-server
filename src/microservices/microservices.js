const Log = require('../util/log');
const Registry = require('../util/registry');

class Microservices {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const serverConfig = Registry.get('ServerConfig');
      if ((!serverConfig) || (!serverConfig.microservices)) {
        const error = 'Error looking up microservices.';
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject({ status: 500, send: error });
        return;
      }
      if (serverConfig.microservices.length === 0) {
        inResolve && inResolve({ status: 200, send: 'There are no microservices.' });
        return;
      }
      const result = [];
      const { microservices } = serverConfig;
      for (let loop = 0; loop < microservices.length; loop++) {
        const service = microservices[loop];
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
module.exports = Microservices;
