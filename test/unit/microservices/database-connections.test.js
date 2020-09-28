/* eslint-disable no-console */
// @formatter:off


const chai = require('chai');
const Log = require('../../../src/util/log');
const Registry = require('../../../src/util/registry');


const { expect } = chai;
const DatabaseConnectionsMicroservice = require('../../../src/microservices/database-connections.js');

const config = {
  databaseConnections: [
    {
      name: 'elasticsearch',
      type: 'elasticsearch',
      description: 'Elasticsearch service.',
      databaseConnector: 'elasticsearch.js',
      generateElasticsearchConnectionAPI: true,
      generateElasticsearchIndexAPI: true,
      generateElasticsearchDataAPI: true,
      config: {
        host: 'localhost:9200',
        log: 'trace',
      },
    },
  ],
};

describe('As a developer, I need need to obtain a list of database connections that are available.', () => {
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
  it('should return a list of database connections available.', (done) => {
    const databaseConnectionsMicroservice = new DatabaseConnectionsMicroservice();
    const expectedResponse = Log.stringify([{
      name: 'elasticsearch',
      description: 'Elasticsearch service.',
    }]);
    Registry.register(config, 'ServerConfig');
    databaseConnectionsMicroservice.do({}).then((response) => {
      expect(response.send).to.be.equal(expectedResponse);
      expect(response.status).to.be.equal(200);
      done();
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
});
