const path = require('path');
const files = require('../util/files.js');
const Log = require('../util/log.js');

const FILE_PATH = path.resolve('./public/files');
class Upload {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const fileName = (((reqInfo) && (reqInfo.params) && (reqInfo.params.name)) ? reqInfo.params.name : 'filename');
      const fullFileName = path.join(FILE_PATH, fileName);
      if (files.existsSync(fullFileName)) {
        const error = { title: fileName, message: 'Conflict: File Already Exists.', error: { status: 409 } };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject({ status: 409, viewName: 'error', viewObject: error });
        return;
      }
      try {
        const uploadedFile = reqInfo.files.filename;
        uploadedFile.mv(fullFileName, (err) => {
          if (err) {
            const error = { message: 'Error uploading file.', error: { status: 500, stack: err.stack } };
            if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
            inReject && inReject({ status: 500, viewName: 'error', viewObject: error });
            return;
          }
          inResolve && inResolve({
            status: 200,
            viewName: 'message',
            viewObject: { title: fileName, message: 'Upload complete.', status: 200 },
          });
        });
      } catch (err) {
        const error = { message: 'Error uploading file.', error: { status: 500, stack: err.stack } };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject({
          status: 500,
          viewName: 'error',
          viewObject: error,
        });
      }
    });
  }
}
module.exports = Upload;
