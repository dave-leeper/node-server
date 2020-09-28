/* eslint-disable import/no-extraneous-dependencies */
// @formatter:off
const chai = require('chai');
const Registry = require('../../../src/util/registry');

const { expect } = chai;
const RememberMicroservice = require('../../../src/microservices/remember.js');

describe('As a developer, I need need to obtain a list of endpoints that are available.', () => {
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

  it('should return the user name for a machine', (done) => {
    const rememberMicroservice = new RememberMicroservice();
    const reqInfo = {
      clientIp: 'test',
    };
    rememberMicroservice.do(reqInfo).then((response) => {
      expect(response.status).to.be.equal(200);
      expect(response.send.username).to.be.equal('A_User');
      done();
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should return 404 for unknown machines', (done) => {
    const rememberMicroservice = new RememberMicroservice();
    const reqIno = {
      clientIp: 'JUNK',
    };
    const expectedResponse = '';
    rememberMicroservice.do(reqIno).then((response) => {
      expect(response.status).to.be.equal(404);
      expect(response.send.username).to.be.equal('');
      done();
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
});
