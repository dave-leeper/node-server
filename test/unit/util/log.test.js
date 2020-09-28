// @formatter:off


const chai = require('chai');

const { expect } = chai;
const recording = require('log4js/lib/appenders/recording');
const Log = require('../../../src/util/log');

const config = {
  appenders: {
    mem: { type: 'recording' },
    out: { type: 'stdout' },
  },
  categories: {
    default: {
      appenders: ['mem', 'out'],
      level: 'trace',
    },
  },
};

describe('As a developer, I need to be able to log information.', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should accept config info', () => {
    try { Log.configure(config); } catch (error) { expect(true).to.be.equal(false); }
  });

  it('should log data', () => {
    Log.configure(config);
    Log.info('TEST DATA');
    const events = recording.replay(); // events is an array of LogEvent objects.
    expect(events).not.to.be.null;
    expect(events.length).to.be.equal(1);
    expect(events[0].categoryName).to.be.equal('default');
    expect(events[0].data).not.to.be.null;
    expect(events[0].data.length).to.be.equal(1);
    expect(events[0].data[0].indexOf('TEST DATA')).not.to.be.equal(-1);
  });

  it('should enable checks to see if a given log level will be logged at current log level', () => {
    Log.level = Log.ALL;
    expect(Log.will(Log.ALL)).to.be.equal(true);
    expect(Log.will(Log.TRACE)).to.be.equal(true);
    expect(Log.will(Log.DEBUG)).to.be.equal(true);
    expect(Log.will(Log.INFO)).to.be.equal(true);
    expect(Log.will(Log.WARN)).to.be.equal(true);
    expect(Log.will(Log.ERROR)).to.be.equal(true);
    expect(Log.will(Log.FATAL)).to.be.equal(true);
    Log.level = Log.TRACE;
    expect(Log.will(Log.ALL)).to.be.equal(false);
    expect(Log.will(Log.TRACE)).to.be.equal(true);
    expect(Log.will(Log.DEBUG)).to.be.equal(true);
    expect(Log.will(Log.INFO)).to.be.equal(true);
    expect(Log.will(Log.WARN)).to.be.equal(true);
    expect(Log.will(Log.ERROR)).to.be.equal(true);
    expect(Log.will(Log.FATAL)).to.be.equal(true);
    Log.level = Log.DEBUG;
    expect(Log.will(Log.ALL)).to.be.equal(false);
    expect(Log.will(Log.TRACE)).to.be.equal(false);
    expect(Log.will(Log.DEBUG)).to.be.equal(true);
    expect(Log.will(Log.INFO)).to.be.equal(true);
    expect(Log.will(Log.WARN)).to.be.equal(true);
    expect(Log.will(Log.ERROR)).to.be.equal(true);
    expect(Log.will(Log.FATAL)).to.be.equal(true);
    Log.level = Log.INFO;
    expect(Log.will(Log.ALL)).to.be.equal(false);
    expect(Log.will(Log.TRACE)).to.be.equal(false);
    expect(Log.will(Log.DEBUG)).to.be.equal(false);
    expect(Log.will(Log.INFO)).to.be.equal(true);
    expect(Log.will(Log.WARN)).to.be.equal(true);
    expect(Log.will(Log.ERROR)).to.be.equal(true);
    expect(Log.will(Log.FATAL)).to.be.equal(true);
    Log.level = Log.WARN;
    expect(Log.will(Log.ALL)).to.be.equal(false);
    expect(Log.will(Log.TRACE)).to.be.equal(false);
    expect(Log.will(Log.DEBUG)).to.be.equal(false);
    expect(Log.will(Log.INFO)).to.be.equal(false);
    expect(Log.will(Log.WARN)).to.be.equal(true);
    expect(Log.will(Log.ERROR)).to.be.equal(true);
    expect(Log.will(Log.FATAL)).to.be.equal(true);
    Log.level = Log.ERROR;
    expect(Log.will(Log.ALL)).to.be.equal(false);
    expect(Log.will(Log.TRACE)).to.be.equal(false);
    expect(Log.will(Log.DEBUG)).to.be.equal(false);
    expect(Log.will(Log.INFO)).to.be.equal(false);
    expect(Log.will(Log.WARN)).to.be.equal(false);
    expect(Log.will(Log.ERROR)).to.be.equal(true);
    expect(Log.will(Log.FATAL)).to.be.equal(true);
    Log.level = Log.FATAL;
    expect(Log.will(Log.ALL)).to.be.equal(false);
    expect(Log.will(Log.TRACE)).to.be.equal(false);
    expect(Log.will(Log.DEBUG)).to.be.equal(false);
    expect(Log.will(Log.INFO)).to.be.equal(false);
    expect(Log.will(Log.WARN)).to.be.equal(false);
    expect(Log.will(Log.ERROR)).to.be.equal(false);
    expect(Log.will(Log.FATAL)).to.be.equal(true);
    Log.level = Log.OFF;
    expect(Log.will(Log.ALL)).to.be.equal(false);
    expect(Log.will(Log.TRACE)).to.be.equal(false);
    expect(Log.will(Log.DEBUG)).to.be.equal(false);
    expect(Log.will(Log.INFO)).to.be.equal(false);
    expect(Log.will(Log.WARN)).to.be.equal(false);
    expect(Log.will(Log.ERROR)).to.be.equal(false);
    expect(Log.will(Log.FATAL)).to.be.equal(false);
  });

  it('should convert strings to log levels', () => {
    expect(Log.getLevelFromString('all')).to.be.equal(Log.ALL);
    expect(Log.getLevelFromString('trace')).to.be.equal(Log.TRACE);
    expect(Log.getLevelFromString('debug')).to.be.equal(Log.DEBUG);
    expect(Log.getLevelFromString('info')).to.be.equal(Log.INFO);
    expect(Log.getLevelFromString('warn')).to.be.equal(Log.WARN);
    expect(Log.getLevelFromString('error')).to.be.equal(Log.ERROR);
    expect(Log.getLevelFromString('fatal')).to.be.equal(Log.FATAL);
    expect(Log.getLevelFromString('ALL')).to.be.equal(Log.ALL);
    expect(Log.getLevelFromString('TRACE')).to.be.equal(Log.TRACE);
    expect(Log.getLevelFromString('DEBUG')).to.be.equal(Log.DEBUG);
    expect(Log.getLevelFromString('INFO')).to.be.equal(Log.INFO);
    expect(Log.getLevelFromString('WARN')).to.be.equal(Log.WARN);
    expect(Log.getLevelFromString('ERROR')).to.be.equal(Log.ERROR);
    expect(Log.getLevelFromString('FATAL')).to.be.equal(Log.FATAL);
  });
});
