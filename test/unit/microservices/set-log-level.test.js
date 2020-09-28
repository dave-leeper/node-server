/* eslint-disable no-console */
// @formatter:off
const chai = require('chai');
const I18n = require('../../../src/util/i18n');
const Log = require('../../../src/util/log');
const Registry = require('../../../src/util/registry');
const Strings = require('../../../src/util/strings');

const { expect } = chai;
const SetLogLevelMicroservice = require('../../../src/microservices/set-log-level.js');

describe('As a developer, I need set the server log level during development.', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
    Registry.unregisterAll();
  });
  it('should set the log level.', (done) => {
    const currentLogLevel = Log.level;
    const setLogLevelMicroservice = new SetLogLevelMicroservice();
    const expectedResponse = Strings.format(I18n.get(Strings.SUCCESS_MESSAGE_LOG_LEVEL_SET), 'ALL');

    expect(Log.level).not.to.be.equal(Log.ALL);
    setLogLevelMicroservice.do({ params: { level: 'ALL' } })
      .then((response) => {
        expect(response.send).to.be.equal(expectedResponse);
        expect(response.status).to.be.equal(200);
        expect(Log.level).to.be.equal(Log.ALL);
        Log.level = currentLogLevel;
        done();
      })
      .catch((error) => {
        expect(true).to.be.equal(false);
      });
  });
});
