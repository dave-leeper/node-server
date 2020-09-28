const Log = require('../util/log');

class LogRequest {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      let level = Log.getLevelFromString('DEBUG');
      const serviceData = ((reqInfo.serviceInfo && reqInfo.serviceInfo.serviceData && reqInfo.serviceInfo.serviceData) ? reqInfo.serviceInfo.serviceData : null);
      if (serviceData && serviceData.level) level = Log.getLevelFromString(serviceData.level);
      let { body } = reqInfo;
      if (body && serviceData && serviceData.json) body = Log.stringify(body);
      Log.log(level, `BODY: ${body}`);
      let { files } = reqInfo;
      if (files && serviceData && serviceData.json) files = Log.stringify(files);
      Log.log(level, `FILES: ${files}`);
      Log.log(level, `HEADERS: ${Log.stringify(reqInfo.headers)}`);
      Log.log(level, `COOKIES: ${Log.stringify(reqInfo.cookies)}`);
      inResolve && inResolve({ status: 200, send: 'Request information printed to log.' });
    });
  }
}
module.exports = LogRequest;
