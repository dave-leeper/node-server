
const log4js = require('log4js');
const os = require('os');
const process = require('process');
const stringifyObject = require('stringify-object');

class Log {
  /**
     * Configures the logger.
     * @param {Object} inConfig - Logging configure. Follows standard log4js format.
     */
  static configure(inConfig) {
    log4js.configure(inConfig);
  }

  static stringify(obj) { return stringifyObject(obj); }

  static get ALL() { return log4js.levels.ALL; }

  static get TRACE() { return log4js.levels.TRACE; }

  static get DEBUG() { return log4js.levels.DEBUG; }

  static get INFO() { return log4js.levels.INFO; }

  static get WARN() { return log4js.levels.WARN; }

  static get ERROR() { return log4js.levels.ERROR; }

  static get FATAL() { return log4js.levels.FATAL; }

  static get OFF() { return log4js.levels.OFF; }

  static set level(inLogLevel) { log4js.getLogger().level = inLogLevel; }

  static get level() { return log4js.getLogger().level; }

  static getLevelFromString(inLogLevel) {
    if (!inLogLevel) return Log.OFF;
    if (inLogLevel.toUpperCase() === 'ALL') return Log.ALL;
    if (inLogLevel.toUpperCase() === 'TRACE') return Log.TRACE;
    if (inLogLevel.toUpperCase() === 'DEBUG') return Log.DEBUG;
    if (inLogLevel.toUpperCase() === 'INFO') return Log.INFO;
    if (inLogLevel.toUpperCase() === 'WARN') return Log.WARN;
    if (inLogLevel.toUpperCase() === 'ERROR') return Log.ERROR;
    if (inLogLevel.toUpperCase() === 'FATAL') return Log.FATAL;
    return Log.OFF;
  }

  static will(inLogLevel) { return log4js.getLogger().isLevelEnabled(inLogLevel); }

  static log(inLogLevel, inPayload) {
    const strMachineId = os.hostname();
    const strProcessID = process.pid;
    const strHostname = os.hostname();
    const strLogMessage = ` | ${strProcessID} | ${strMachineId} | ${strHostname} | ${inPayload}`;

    log4js.getLogger().log(inLogLevel, strLogMessage);
  }

  static all(inPayload) { this.log(this.ALL, inPayload); }

  static trace(inPayload) { this.log(this.TRACE, inPayload); }

  static debug(inPayload) { this.log(this.DEBUG, inPayload); }

  static info(inPayload) { this.log(this.INFO, inPayload); }

  static warn(inPayload) { this.log(this.WARN, inPayload); }

  static error(inPayload) { this.log(this.ERROR, inPayload); }

  static fatal(inPayload) { this.log(this.FATAL, inPayload); }
}
module.exports = Log;
