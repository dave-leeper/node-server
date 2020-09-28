//@formatter:off
'use strict';

let chai = require( 'chai' ),
    expect = chai.expect,
    DatabaseConnectorManager = require('../../../src/database/database-connection-manager.js'),
    Registry = require('../../../src/util/registry.js');
let config = {
    databaseConnections : [
        {
            name: "elasticsearch",
            description: "Elasticsearch service.",
            databaseConnector: "elasticsearch.js",
            config: {
                host: "localhost:9200",
                log: "trace"
            }
        }
    ]
};

describe( 'As a developer, I need to manage database connections.', function()
{
    before(() => {
    });
    beforeEach(() => {
        Registry.unregisterAll();
    });
    afterEach(() => {
    });
    after(() => {
    });
    it ( 'It should create all requested database connections', ( done ) => {
        let dbConnectionManager = new DatabaseConnectorManager();

        expect(dbConnectionManager).to.not.be.null;
        dbConnectionManager.connect(config).then ((error, param2) => {
            expect(dbConnectionManager.config).to.be.equal(config);
            expect(dbConnectionManager.databaseConnectors.length).to.be.equal(1);

            let elasticSearchDC = dbConnectionManager.getConnection("elasticsearch");
            expect(elasticSearchDC).to.not.be.null;
            dbConnectionManager.disconnect().then(() => {
                done();
            });
        });
    });
});


