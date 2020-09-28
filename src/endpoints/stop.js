const Registry = require('../util/registry');
const ServiceBase = require('../util/service-base.js');

class Stop extends ServiceBase {
  constructor(configInfo) {
    super();
    this.configInfo = configInfo;
  }

  do(req, res, next) {
    this.addHeaders(this.configInfo, req, res);
    this.addCookies(this.configInfo, req, res);
    const server = Registry.get('Server');
    if (!server || !server.stop) {
      const jsonResponse = JSON.stringify({ status: 'Error stopping server.' });
      res.status(500);
      res.send(jsonResponse);
      next && next();
      return;
    }
    const jsonResponse = JSON.stringify({ status: 'Stopping server...' });
    res.status(200);
    res.send(jsonResponse);
    server.stop();
  }
}

module.exports = Stop;
