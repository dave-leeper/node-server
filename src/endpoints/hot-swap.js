const Registry = require('../util/registry');
const ServiceBase = require('../util/service-base.js');

class HotSwap extends ServiceBase {
  constructor(configInfo) {
    super();
    this.configInfo = configInfo;
  }

  do(req, res, next) {
    this.addHeaders(this.configInfo, req, res);
    this.addCookies(this.configInfo, req, res);
    const server = Registry.get('Server');
    const uploadedFile = req.files.filename;
    const rawConfig = ((uploadedFile) ? uploadedFile.data : null);
    const config = ((rawConfig) ? rawConfig.toString() : null);
    if (!server || !server.createRouter || !server.useRouter || !uploadedFile || !config) {
      const jsonResponse = JSON.stringify({ status: 'Error hot-swapping server.' });
      res.status(500);
      res.send(jsonResponse);
      next && next();
      return;
    }
    const jsonResponse = JSON.stringify({ status: 'Hot-swapping server...' });
    res.status(200);
    res.send(jsonResponse);
    const parsedConfig = JSON.parse(config);
    const router = server.createRouter(parsedConfig);
    server.useRouter(router);
  }
}

module.exports = HotSwap;
