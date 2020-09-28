const I18n = require('../util/i18n');
const Log = require('../util/log');
const Strings = require('../util/strings');

class SetLogLevel {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const newLogLevel = reqInfo.params.level.toUpperCase();
      const message = Strings.format(I18n.get(Strings.SUCCESS_MESSAGE_LOG_LEVEL_SET), reqInfo.params.level);
      if (newLogLevel === 'ALL') {
        Log.level = Log.ALL;
        inResolve && inResolve({ status: 200, send: message });
      } else if (newLogLevel === 'TRACE') {
        Log.level = Log.TRACE;
        inResolve && inResolve({ status: 200, send: message });
      } else if (newLogLevel === 'DEBUG') {
        Log.level = Log.DEBUG;
        inResolve && inResolve({ status: 200, send: message });
      } else if (newLogLevel === 'INFO') {
        Log.level = Log.INFO;
        inResolve && inResolve({ status: 200, send: message });
      } else if (newLogLevel === 'WARN') {
        Log.level = Log.WARN;
        inResolve && inResolve({ status: 200, send: message });
      } else if (newLogLevel === 'ERROR') {
        Log.level = Log.ERROR;
        inResolve && inResolve({ status: 200, send: message });
      } else if (newLogLevel === 'FATAL') {
        Log.level = Log.FATAL;
        inResolve && inResolve({ status: 200, send: message });
      } else if (newLogLevel === 'OFF') {
        Log.level = Log.OFF;
        inResolve && inResolve({ status: 200, send: message });
      } else {
        const errorMessage = Strings.format(I18n.get(Strings.ERROR_MESSAGE_UNKNOWN_LOG_LEVEL), reqInfo.params.level);
        if (Log.will(Log.ERROR)) Log.error(errorMessage);
        inReject && inReject({ status: 400, send: errorMessage });
      }
    });
  }
}

module.exports = SetLogLevel;
