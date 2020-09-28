// @formatter:off


const chai = require('chai');

const { expect } = chai;

const passport = require('passport');
const Registry = require('../../../src/util/registry.js');
const MockExpressRouter = require('../../mocks/mock-express-router.js');
const RouteBuilder = require('../../../src/routers/route-builder.js');
const RouteBuilderElasticsearchDatabase = require('../../../src/routers/route-builder-elasticsearch-database.js');

const config = {
  databaseConnections: [
    {
      name: 'elasticsearch',
      type: 'elasticsearch',
      description: 'Elasticsearch service.',
      databaseConnector: 'elasticsearch.js',
      config: {
        host: 'localhost:9200',
        log: 'trace',
      },
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
  ],
};
const config2 = {
  databaseConnections: [
    {
      name: 'elasticsearch',
      type: 'elasticsearch',
      description: 'Elasticsearch service.',
      databaseConnector: 'elasticsearch.js',
      generateElasticsearchConnectionAPI: true,
      config: {
        host: 'localhost:9200',
        log: 'trace',
      },
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
  ],
};
const config3 = {
  databaseConnections: [
    {
      name: 'elasticsearch',
      type: 'elasticsearch',
      description: 'Elasticsearch service.',
      databaseConnector: 'elasticsearch.js',
      generateElasticsearchIndexAPI: true,
      config: {
        host: 'localhost:9200',
        log: 'trace',
      },
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
  ],
};
const config4 = {
  databaseConnections: [
    {
      name: 'elasticsearch',
      type: 'elasticsearch',
      description: 'Elasticsearch service.',
      databaseConnector: 'elasticsearch.js',
      generateElasticsearchDataAPI: true,
      config: {
        host: 'localhost:9200',
        log: 'trace',
      },
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
  ],
};
const config5 = {
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
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
  ],
};
const configInfo = {
  name: 'elasticsearch',
  type: 'elasticsearch',
  description: 'Elasticsearch service.',
  databaseConnector: 'elasticsearch.js',
  config: {
    host: 'localhost:9200',
    log: 'trace',
  },
};

const containsPath = (array, path) => {
  for (let loop = 0; loop < array.length; loop++) {
    if (array[loop].path === path) return true;
  }
  return false;
};
const hasHandler = (array, path) => {
  for (let loop = 0; loop < array.length; loop++) {
    if (array[loop].path === path) return !!(array[loop].handler);
  }
  return false;
};

describe('As a developer, I need an API for creating database connections', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });
  it('should not build routes using bad parameters', () => {
    const routeBuilderDatabase = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    let result = routeBuilderDatabase.connect(null, null);
    expect(result).to.be.equal(false);
    result = routeBuilderDatabase.connect({}, {});
    expect(result).to.be.equal(false);
    result = routeBuilderDatabase.connect(mockExpressRouter, {});
    expect(result).to.be.equal(false);
    result = routeBuilderDatabase.connect({}, config);
    expect(result).to.be.equal(false);
  });
  it('should build connection API paths from a name', () => {
    const paths = RouteBuilderElasticsearchDatabase.buildElasticsearchConnectionAPIPaths('test');
    expect(Array.isArray(paths)).to.be.equal(true);
    expect(paths.length).to.be.equal(3);
    expect(paths[0]).to.be.equal('/test/connection/connect');
    expect(paths[1]).to.be.equal('/test/connection/ping');
    expect(paths[2]).to.be.equal('/test/connection/disconnect');
  });
  it('should build index API paths from a name', () => {
    const paths = RouteBuilderElasticsearchDatabase.buildElasticsearchIndexAPIPaths('test');
    expect(Array.isArray(paths)).to.be.equal(true);
    expect(paths.length).to.be.equal(4);
    expect(paths[0]).to.be.equal('/test/index/:index/exists');
    expect(paths[1]).to.be.equal('/test/index');
    expect(paths[2]).to.be.equal('/test/index/:index');
    expect(paths[3]).to.be.equal('/test/index/mapping');
  });
  it('should build data API paths from a name', () => {
    const paths = RouteBuilderElasticsearchDatabase.buildElasticsearchDataAPIPaths('test');
    expect(Array.isArray(paths)).to.be.equal(true);
    expect(paths.length).to.be.equal(4);
    expect(paths[0]).to.be.equal('/test/data');
    expect(paths[1]).to.be.equal('/test/data/update');
    expect(paths[2]).to.be.equal('/test/data/:index/:type/:id');
    expect(paths[3]).to.be.equal('/test/data/:index/:type/:id');
  });
  it('should be build connection routes based on config information', () => {
    const routeBuilderDatabase = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    routeBuilderDatabase.buildElasticsearchConnectionAPI(mockExpressRouter, config, configInfo);
    expect(mockExpressRouter.gets.length).to.be.equal(3);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(0);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(0);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
  });
  it('should be build index routes based on config information', () => {
    const routeBuilderDatabase = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    routeBuilderDatabase.buildElasticsearchIndexAPI(mockExpressRouter, config, configInfo);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(2);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
  });
  it('should be build data routes based on config information', () => {
    const routeBuilderDatabase = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    routeBuilderDatabase.buildElasticsearchDataAPI(mockExpressRouter, config, configInfo);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(2);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
  });
  it('should build routes to handlers based on config information', () => {
    const routeBuilderMicroservices = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    let result = routeBuilderMicroservices.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(0);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(0);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(0);
    mockExpressRouter.reset();
    result = routeBuilderMicroservices.connect(mockExpressRouter, config2);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(3);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(0);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(0);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    mockExpressRouter.reset();
    result = routeBuilderMicroservices.connect(mockExpressRouter, config3);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(2);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    mockExpressRouter.reset();
    result = routeBuilderMicroservices.connect(mockExpressRouter, config4);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(2);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    mockExpressRouter.reset();
    result = routeBuilderMicroservices.connect(mockExpressRouter, config5);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(5);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(4);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(2);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
  });
  it('should support authentication', () => {
    const config = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
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
          authentication: 'local',
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderDatabase = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderDatabase.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(5);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(4);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(2);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
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
    expect(Array.isArray(mockExpressRouter.posts[2].handler)).to.be.equal(true);
    expect(mockExpressRouter.posts[2].handler.length).to.be.equal(3);
    expect(Array.isArray(mockExpressRouter.posts[3].handler)).to.be.equal(true);
    expect(mockExpressRouter.posts[3].handler.length).to.be.equal(3);
    expect(Array.isArray(mockExpressRouter.deletes[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.deletes[0].handler.length).to.be.equal(3);
    expect(Array.isArray(mockExpressRouter.deletes[1].handler)).to.be.equal(true);
    expect(mockExpressRouter.deletes[1].handler.length).to.be.equal(3);
  });
  it('should support authorization', () => {
    const config = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
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
          authorization: { strategy: 'local', groups: ['admin'] },
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderDatabase = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderDatabase.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(5);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(4);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(2);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
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
    expect(Array.isArray(mockExpressRouter.posts[2].handler)).to.be.equal(true);
    expect(mockExpressRouter.posts[2].handler.length).to.be.equal(3);
    expect(Array.isArray(mockExpressRouter.posts[3].handler)).to.be.equal(true);
    expect(mockExpressRouter.posts[3].handler.length).to.be.equal(3);
    expect(Array.isArray(mockExpressRouter.deletes[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.deletes[0].handler.length).to.be.equal(3);
    expect(Array.isArray(mockExpressRouter.deletes[1].handler)).to.be.equal(true);
    expect(mockExpressRouter.deletes[1].handler.length).to.be.equal(3);
  });
  it('should support logging', () => {
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
          logging: 'ALL',
        },
      ],
    };
    const routeBuilderDatabase = new RouteBuilderElasticsearchDatabase();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderDatabase.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(5);
    expect(mockExpressRouter.option.length).to.be.equal(0);
    expect(mockExpressRouter.posts.length).to.be.equal(4);
    expect(mockExpressRouter.puts.length).to.be.equal(0);
    expect(mockExpressRouter.patches.length).to.be.equal(0);
    expect(mockExpressRouter.deletes.length).to.be.equal(2);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/connect')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/ping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/connection/disconnect')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/index/:index/exists')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/index/:index')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/index/mapping')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/elasticsearch/data/update')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/elasticsearch/data/:index/:type/:id')).to.be.equal(true);
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
    expect(Array.isArray(mockExpressRouter.posts[2].handler)).to.be.equal(true);
    expect(mockExpressRouter.posts[2].handler.length).to.be.equal(4);
    expect(Array.isArray(mockExpressRouter.posts[3].handler)).to.be.equal(true);
    expect(mockExpressRouter.posts[3].handler.length).to.be.equal(4);
    expect(Array.isArray(mockExpressRouter.deletes[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.deletes[0].handler.length).to.be.equal(4);
    expect(Array.isArray(mockExpressRouter.deletes[1].handler)).to.be.equal(true);
    expect(mockExpressRouter.deletes[1].handler.length).to.be.equal(4);
  });
});
