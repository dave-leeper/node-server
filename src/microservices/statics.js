/* eslint-disable no-underscore-dangle */
const Log = require('../util/log');
const Registry = require('../util/registry');

class Statics {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const serverConfig = Registry.get('ServerConfig');
      if ((!serverConfig) || (!serverConfig.statics)) {
        const error = { status: 500, send: 'Error looking up statics services.' };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject(error);
        return;
      }
      if (serverConfig.statics.length === 0) {
        inResolve && inResolve({ status: 200, send: 'There are no statics services.' });
        return;
      }
      const result = [];
      const { statics } = serverConfig;
      for (let loop = 0; loop < statics.length; loop++) {
        const _static = statics[loop];
        result.push({
          path: _static.path,
          response: _static.response,
          responseType: _static.responseType,
        });
      }
      inResolve && inResolve({ status: 200, send: Log.stringify(result) });
    });
  }
}
module.exports = Statics;
