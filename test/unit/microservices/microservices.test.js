// @formatter:off
const chai = require('chai');
const Log = require('../../../src/util/log');
const Registry = require('../../../src/util/registry');

const { expect } = chai;
const MicroservicesMicroservice = require('../../../src/microservices/microservices.js');

const config = {
  microservices: [
    {
      path: '/endpoints',
      name: 'Services List',
      description: 'Provides a list of endpoints registered with this server.',
      serviceFile: 'util.js',
    },
    {
      path: '/statics',
      name: 'Static Services List',
      description: 'Provides a list of static services registered with this server.',
      serviceFile: 'statics.js',
    },
  ],
};

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
  it('should return a list of endpoints available.', (done) => {
    const microservicesMicroservice = new MicroservicesMicroservice();
    const expectedResponse = Log.stringify([{
      name: 'Services List',
      path: '/endpoints',
      description: 'Provides a list of endpoints registered with this server.',
    },
    {
      name: 'Static Services List',
      path: '/statics',
      description: 'Provides a list of static services registered with this server.',
    }]);
    Registry.register(config, 'ServerConfig');
    microservicesMicroservice.do({}).then((response) => {
      expect(response.send).to.be.equal(expectedResponse);
      expect(response.status).to.be.equal(200);
      done();
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
});
