// @formatter:off


const chai = require('chai');

const { expect } = chai;

const passport = require('passport');
const Registry = require('../../../src/util/registry.js');
const MockExpressRouter = require('../../mocks/mock-express-router.js');
const RouteBuilder = require('../../../src/routers/route-builder.js');
const RouteBuilderEndpoints = require('../../../src/routers/route-builder-endpoints.js');

const config = {
  endpoints: [
    {
      path: '/get_endpoint',
      name: 'An endpoint',
      description: 'An endpoint used for testing',
      serviceFile: 'stop.js',
    },
    {
      verb: 'OPTIONS',
      path: '/options_endpoint',
      name: 'An endpoint',
      description: 'An endpoint used for testing',
      serviceFile: 'stop.js',
    },
    {
      verb: 'POST',
      path: '/post_endpoint',
      name: 'An endpoint',
      description: 'An endpoint used for testing',
      serviceFile: 'stop.js',
    },
    {
      verb: 'PUT',
      path: '/put_endpoint',
      name: 'An endpoint',
      description: 'An endpoint used for testing',
      serviceFile: 'stop.js',
    },
    {
      verb: 'PATCH',
      path: '/patch_endpoint',
      name: 'An endpoint',
      description: 'An endpoint used for testing',
      serviceFile: 'stop.js',
    },
    {
      verb: 'DELETE',
      path: '/delete_endpoint',
      name: 'An endpoint',
      description: 'An endpoint used for testing',
      serviceFile: 'stop.js',
    },
  ],
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
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should not build routes using bad parameters', () => {
    const routeBuilderEndpoints = new RouteBuilderEndpoints();
    const mockExpressRouter = new MockExpressRouter();
    let result = routeBuilderEndpoints.connect(null, null);
    expect(result).to.be.equal(false);
    result = routeBuilderEndpoints.connect({}, {});
    expect(result).to.be.equal(false);
    result = routeBuilderEndpoints.connect(mockExpressRouter, {});
    expect(result).to.be.equal(false);
    result = routeBuilderEndpoints.connect({}, config);
    expect(result).to.be.equal(false);
  });

  it('should be build routes to handlers based on config information', () => {
    const routeBuilderEndpoints = new RouteBuilderEndpoints();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderEndpoints.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(mockExpressRouter.option.length).to.be.equal(1);
    expect(mockExpressRouter.posts.length).to.be.equal(1);
    expect(mockExpressRouter.puts.length).to.be.equal(1);
    expect(mockExpressRouter.patches.length).to.be.equal(1);
    expect(mockExpressRouter.deletes.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.option, '/options_endpoint')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/post_endpoint')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.puts, '/put_endpoint')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.patches, '/patch_endpoint')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/delete_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.option, '/options_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/post_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.puts, '/put_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.patches, '/patch_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/delete_endpoint')).to.be.equal(true);
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
      endpoints: [
        {
          path: '/get_endpoint',
          name: 'An endpoint',
          description: 'An endpoint used for testing',
          serviceFile: 'stop.js',
          authentication: 'local',
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderEndpoints = new RouteBuilderEndpoints();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderEndpoints.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.gets[0].handler.length).to.be.equal(3);
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
      endpoints: [
        {
          path: '/get_endpoint',
          name: 'An endpoint',
          description: 'An endpoint used for testing',
          serviceFile: 'stop.js',
          authorization: { strategy: 'local', groups: ['admin'] },
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderEndpoints = new RouteBuilderEndpoints();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderEndpoints.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.gets[0].handler.length).to.be.equal(3);
  });

  it('should support logging', () => {
    const config = {
      endpoints: [
        {
          path: '/get_endpoint',
          name: 'An endpoint',
          description: 'An endpoint used for testing',
          serviceFile: 'stop.js',
          logging: 'ALL',
        },
      ],
    };
    const routeBuilderEndpoints = new RouteBuilderEndpoints();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderEndpoints.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_endpoint')).to.be.equal(true);
    expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.gets[0].handler.length).to.be.equal(4);
  });
});
