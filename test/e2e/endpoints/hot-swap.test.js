// @formatter:off


const chai = require('chai');

const { expect } = chai;
const request = require('request');
const path = require('path');
const fs = require('fs');
const MockRequest = require('../../mocks/mock-request');
const MockResponse = require('../../mocks/mock-response');
const Registry = require('../../../src/util/registry');
const Server = require('../../../server.js');
const Log = require('../../../src/util/log');

const server = new Server();
const port = '1337';
const config = {
  statics: [
    {
      path: '/ping',
      response: { name: 'My Server', version: '1.0' },
      responseType: 'JSON',
    },
  ],
  endpoints: [
    {
      verb: 'POST',
      path: '/hotswap',
      name: 'Hot swap',
      description: 'Hot swaps the server configuration.',
      serviceFile: 'hot-swap.js',
    },
  ],
};

describe('As a developer, I need need to Hotswap the server with an API call', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
  });
  
  it('should hot-swap the server', (done) => {
    const newConfigFile = path.resolve('./test/e2e/endpoints', 'server-config2.json');
    const formData = { filename: fs.createReadStream(newConfigFile) };
    const hotSwapURL = `http://localhost:${port}/hotswap`;
    const pingURL = `http://localhost:${port}/ping`;
    server.init(port, config, () => {
      request(pingURL, { json: true }, (err1, res1, body1) => {
        expect(body1.name).to.be.equal('My Server');
        expect(body1.version).to.be.equal('1.0');
        request.post({ url: hotSwapURL, formData }, (err2, res2, body2) => {
          expect(res2.statusCode).to.be.equal(200);
          request(pingURL, { json: true }, (err3, res3, body3) => {
            expect(body3.name).to.be.equal('My Server');
            expect(body3.version).to.be.equal('2.0');
            server.stop(() => { done(); });
          });
        });
      });
    });
  });
});
