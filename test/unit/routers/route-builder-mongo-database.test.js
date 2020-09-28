//@formatter:off
'use strict';

let chai = require( 'chai' ),
    expect = chai.expect;

const Registry = require('../../../src/util/registry.js');
const MockExpressRouter = require('../../mocks/mock-express-router.js');
const RouteBuilder = require('../../../src/routers/route-builder.js');
const RouteBuilderMongoDatabase = require('../../../src/routers/route-builder-mongo-database.js');
const passport = require('passport');

let config = {
    "databaseConnections" : [
        {
            "name": "mongo",
            "type": "mongo",
            "description": "Mongo service.",
            "databaseConnector": "mongodb.js",
            "generateMongoDataAPI": true,
            "config": {
                "url": 'mongodb://localhost:27017',
                "db": 'testdb',
                "collections": {
                    "testCollection": { "w": 0 }
                }
            },
            "headers": [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]
        }
    ]
};
let config2 = {
    "databaseConnections" : [
        {
            "name": "mongo",
            "type": "mongo",
            "description": "Mongo service.",
            "databaseConnector": "mongodb.js",
            "generateMongoConnectionAPI": true,
            "config": {
                "url": 'mongodb://localhost:27017',
                "db": 'testdb',
                "collections": {
                    "testCollection": { "w": 0 }
                }
            },
            "headers": [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]
        }
    ]
};
let config3 = {
    "databaseConnections" : [
        {
            "name": "mongo",
            "type": "mongo",
            "description": "Mongo service.",
            "databaseConnector": "mongodb.js",
            "generateMongoCollectionAPI": true,
            "config": {
                "url": 'mongodb://localhost:27017',
                "db": 'testdb',
                "collections": {
                    "testCollection": { "w": 0 }
                }
            },
            "headers": [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]
        }
    ]
};
let config4 = {
    "databaseConnections" : [
        {
            "name": "mongo",
            "type": "mongo",
            "description": "Mongo service.",
            "databaseConnector": "mongodb.js",
            "generateMongoDataAPI": true,
            "config": {
                "url": 'mongodb://localhost:27017',
                "db": 'testdb',
                "collections": {
                    "testCollection": { "w": 0 }
                }
            },
            "headers": [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]
        }
    ]
};
let config5 = {
    "databaseConnections" : [
        {
            "name": "mongo",
            "type": "mongo",
            "description": "Mongo service.",
            "databaseConnector": "mongodb.js",
            "generateMongoConnectionAPI": true,
            "generateMongoCollectionAPI": true,
            "generateMongoDataAPI": true,
            "config": {
                "url": 'mongodb://localhost:27017',
                "db": 'testdb',
                "collections": {
                    "testCollection": { "w": 0 }
                }
            },
            "headers": [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]
        }
    ]
};
let configInfo = {
    name: "mongo",
    type: "mongo",
    description: "Mongo service.",
    databaseConnector: "mongodb.js",
    config: {
        url: 'mongodb://localhost:27017',
        db: 'testdb',
        collections: {
            testCollection: { w: 0 }
        }
    },
};

let containsPath = (array, path) => {
    for (let loop = 0; loop < array.length; loop++) {
        if (array[loop].path === path) return true;
    }
    return false;
};
let hasHandler = (array, path) => {
    for (let loop = 0; loop < array.length; loop++) {
        if (array[loop].path === path) return !!(array[loop].handler);
    }
    return false;
};

describe( 'As a developer, I need an API for creating database connections', function() {
    before(() => {
    });
    beforeEach(() => {
    });
    afterEach(() => {
    });
    after(() => {
    });
    it ( 'should not build routes using bad parameters', ( ) => {
        let routeBuilderDatabase = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        let result = routeBuilderDatabase.connect( null, null );
        expect(result).to.be.equal(false);
        result = routeBuilderDatabase.connect( {}, {} );
        expect(result).to.be.equal(false);
        result = routeBuilderDatabase.connect( mockExpressRouter, {} );
        expect(result).to.be.equal(false);
        result = routeBuilderDatabase.connect( {}, config );
        expect(result).to.be.equal(false);
    });
    it ( 'should build connection API paths from a name', ( ) => {
        let paths = RouteBuilderMongoDatabase.buildMongoConnectionAPIPaths('test');
        expect(Array.isArray(paths)).to.be.equal(true);
        expect(paths.length).to.be.equal(3);
        expect(paths[0]).to.be.equal('/test/connection/connect');
        expect(paths[1]).to.be.equal('/test/connection/ping');
        expect(paths[2]).to.be.equal('/test/connection/disconnect');
    });
    it ( 'should build collection API paths from a name', ( ) => {
        let paths = RouteBuilderMongoDatabase.buildMongoCollectionAPIPaths('test');
        expect(Array.isArray(paths)).to.be.equal(true);
        expect(paths.length).to.be.equal(3);
        expect(paths[0]).to.be.equal('/test/collection/:collection/exists');
        expect(paths[1]).to.be.equal('/test/collection/:collection');
        expect(paths[2]).to.be.equal('/test/collection/:collection');
    });
    it ( 'should build data API paths from a name', ( ) => {
        let paths = RouteBuilderMongoDatabase.buildMongoDataAPIPaths('test');
        expect(Array.isArray(paths)).to.be.equal(true);
        expect(paths.length).to.be.equal(4);
        expect(paths[0]).to.be.equal('/test/data/:collection');
        expect(paths[1]).to.be.equal('/test/data/:collection');
        expect(paths[2]).to.be.equal('/test/data/:collection');
        expect(paths[3]).to.be.equal('/test/data/:collection');
    });
    it ( 'should be build connection routes based on config information', ( ) => {
        let routeBuilderDatabase = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        routeBuilderDatabase.buildMongoConnectionAPI( mockExpressRouter, config, configInfo );
        expect(mockExpressRouter.gets.length).to.be.equal(3);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(0);
        expect(mockExpressRouter.puts.length).to.be.equal(0);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(0);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
    });
    it ( 'should be build index routes based on config information', ( ) => {
        let routeBuilderDatabase = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        routeBuilderDatabase.buildMongoCollectionAPI( mockExpressRouter, config, configInfo );
        expect(mockExpressRouter.gets.length).to.be.equal(1);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(1);
        expect(mockExpressRouter.puts.length).to.be.equal(0);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(1);
        expect(containsPath(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
    });
    it ( 'should be build data routes based on config information', ( ) => {
        let routeBuilderDatabase = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        routeBuilderDatabase.buildMongoDataAPI( mockExpressRouter, config, configInfo );
        expect(mockExpressRouter.gets.length).to.be.equal(1);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(1);
        expect(mockExpressRouter.puts.length).to.be.equal(1);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(1);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
    });
    it ( 'should build routes to handlers based on config information', ( ) => {
        let routeBuilderMicroservices = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        let result = routeBuilderMicroservices.connect( mockExpressRouter, config );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(1);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(1);
        expect(mockExpressRouter.puts.length).to.be.equal(1);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(1);
        mockExpressRouter.reset();
        result = routeBuilderMicroservices.connect( mockExpressRouter, config2 );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(3);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(0);
        expect(mockExpressRouter.puts.length).to.be.equal(0);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(0);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        mockExpressRouter.reset();
        result = routeBuilderMicroservices.connect( mockExpressRouter, config3 );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(1);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(1);
        expect(mockExpressRouter.puts.length).to.be.equal(0);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(1);
        expect(containsPath(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        mockExpressRouter.reset();
        result = routeBuilderMicroservices.connect( mockExpressRouter, config4 );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(1);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(1);
        expect(mockExpressRouter.puts.length).to.be.equal(1);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(1);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        mockExpressRouter.reset();
        result = routeBuilderMicroservices.connect( mockExpressRouter, config5 );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(5);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(2);
        expect(mockExpressRouter.puts.length).to.be.equal(1);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(2);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.puts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
    });
    it ( 'should support authentication', ( ) => {
        let config = {
            authentication: [
                {
                    name: "local",
                    strategyFile: "local-strategy.js",
                    config: { "successRedirect": "/ping", "failureRedirect": "/login"}
                }
            ],
            databaseConnections : [
                {
                    name: "mongo",
                    type: "mongo",
                    description: "Mongo service.",
                    databaseConnector: "mongodb.js",
                    generateMongoConnectionAPI: true,
                    generateMongoCollectionAPI: true,
                    generateMongoDataAPI: true,
                    config: {
                        url: 'mongodb://localhost:27017',
                        db: 'testdb',
                        log: 'trace',
                        collections: {
                            testCollection: { w: 0 }
                        }
                    },
                    authentication: "local"
                }
            ]
        };
        Registry.register(passport, 'Passport');
        RouteBuilder.buildAuthenticationStrategies(config);

        let routeBuilderDatabase = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        let result = routeBuilderDatabase.connect( mockExpressRouter, config );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(5);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(2);
        expect(mockExpressRouter.puts.length).to.be.equal(1);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(2);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.puts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[1].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[2].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[2].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[3].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[3].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[4].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[4].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.posts[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.posts[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.posts[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.posts[1].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.puts[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.puts[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.deletes[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.deletes[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.deletes[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.deletes[1].handler.length).to.be.equal(3);
    });
    it ( 'should support authorization', ( ) => {
        let config = {
            authentication: [
                {
                    name: "local",
                    strategyFile: "local-strategy.js",
                    config: { "successRedirect": "/ping", "failureRedirect": "/login"}
                }
            ],
            databaseConnections : [
                {
                    name: "mongo",
                    type: "mongo",
                    description: "Mongo service.",
                    databaseConnector: "mongodb.js",
                    generateMongoConnectionAPI: true,
                    generateMongoCollectionAPI: true,
                    generateMongoDataAPI: true,
                    config: {
                        config: {
                            url: 'mongodb://localhost:27017',
                            db: 'testdb',
                            log: 'trace',
                            collections: {
                                testCollection: { w: 0 }
                            }
                        }
                    },
                    authorization:  { strategy: "local", groups: [ "admin" ] }
                }
            ]
        };
        Registry.register(passport, 'Passport');
        RouteBuilder.buildAuthenticationStrategies(config);

        let routeBuilderDatabase = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        let result = routeBuilderDatabase.connect( mockExpressRouter, config );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(5);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(2);
        expect(mockExpressRouter.puts.length).to.be.equal(1);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(2);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.puts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[1].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[2].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[2].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[3].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[3].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.gets[4].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[4].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.posts[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.posts[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.posts[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.posts[1].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.puts[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.puts[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.deletes[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.deletes[0].handler.length).to.be.equal(3);
        expect(Array.isArray(mockExpressRouter.deletes[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.deletes[1].handler.length).to.be.equal(3);
    });
    it ( 'should support logging', ( ) => {
        let config = {
            databaseConnections : [
                {
                    name: "mongo",
                    type: "mongo",
                    description: "Mongo service.",
                    databaseConnector: "mongodb.js",
                    generateMongoConnectionAPI: true,
                    generateMongoCollectionAPI: true,
                    generateMongoDataAPI: true,
                    config: {
                        config: {
                            url: 'mongodb://localhost:27017',
                            db: 'testdb',
                            log: 'trace',
                            collections: {
                                testCollection: { w: 0 }
                            }
                        }
                    },
                    logging:  'ALL'
                }
            ]
        };
        let routeBuilderDatabase = new RouteBuilderMongoDatabase();
        let mockExpressRouter = new MockExpressRouter();
        let result = routeBuilderDatabase.connect( mockExpressRouter, config );
        expect(result).to.be.equal(true);
        expect(mockExpressRouter.gets.length).to.be.equal(5);
        expect(mockExpressRouter.option.length).to.be.equal(0);
        expect(mockExpressRouter.posts.length).to.be.equal(2);
        expect(mockExpressRouter.puts.length).to.be.equal(1);
        expect(mockExpressRouter.patches.length).to.be.equal(0);
        expect(mockExpressRouter.deletes.length).to.be.equal(2);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/connect')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/ping')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/connection/disconnect')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/collection/:collection/exists')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/collection/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/collection/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.puts, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(containsPath(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.posts, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.deletes, '/mongo/data/:collection')).to.be.equal(true);
        expect(hasHandler(mockExpressRouter.gets, '/mongo/data/:collection')).to.be.equal(true);
        expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[0].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.gets[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[1].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.gets[2].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[2].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.gets[3].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[3].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.gets[4].handler)).to.be.equal(true);
        expect(mockExpressRouter.gets[4].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.posts[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.posts[0].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.posts[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.posts[1].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.puts[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.puts[0].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.deletes[0].handler)).to.be.equal(true);
        expect(mockExpressRouter.deletes[0].handler.length).to.be.equal(4);
        expect(Array.isArray(mockExpressRouter.deletes[1].handler)).to.be.equal(true);
        expect(mockExpressRouter.deletes[1].handler.length).to.be.equal(4);
    });
});
