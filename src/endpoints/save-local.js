const path = require('path');
const files = require('../util/files.js');
const ServiceBase = require('../util/service-base.js');

const FILE_PATH = path.resolve('./public/files');
let number = 0;

class SaveLocal extends ServiceBase {
  constructor(configInfo) {
    super();
    this.configInfo = configInfo;
  }

  do(req, res, next) {
    const { serviceData } = this.configInfo;
    const dataParam = (serviceData && serviceData.bodyField) ? serviceData.bodyField : 'text';
    const fileExt = (serviceData && serviceData.fileExt) ? serviceData.fileExt : 'txt';
    const data = req.body[dataParam];
    let fileName = `${FILE_PATH}/File.${fileExt}`;

    while (files.existsSync(fileName)) {
      number++;
      fileName = `${FILE_PATH}/File_${number}.${fileExt}`;
    }
    files.writeFileSync(fileName, data);

    res.status(200);
    res.setHeader('Content-Disposition', `"${fileName}"`);
    res.download(fileName, (err) => {
      files.deleteSync(fileName);
      if (number > 9999) {
        number = 0;
      }
      if (err) {
        next(err);
      }
    });
  }
}
module.exports = SaveLocal;
