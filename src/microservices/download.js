const path = require('path');
const Log = require('../util/log');
const files = require('../util/files.js');

const FILE_PATH = path.resolve('./public/files');
class Download {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const fileName = (((reqInfo) && (reqInfo.params) && (reqInfo.params.name)) ? reqInfo.params.name : 'filename');
      const filePath = path.join(FILE_PATH, fileName);
      if (!files.existsSync(filePath)) {
        const error = `File (${fileName}) not found.`;
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject({
          status: 404,
          send: error,
          viewName: 'error',
          viewObject: {
            title: fileName,
            message: error,
            error: { status: 404 },
          },
        });
        return;
      }
      inResolve && inResolve({ status: 200, fileDownloadPath: filePath });
    });
  }
}
module.exports = Download;
