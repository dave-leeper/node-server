// @formatter:off


const chai = require('chai');

const { expect } = chai;

const passport = require('passport');
const Registry = require('../../../src/util/registry.js');
const MockExpressRouter = require('../../mocks/mock-express-router.js');
const RouteBuilder = require('../../../src/routers/route-builder.js');
const RouteBuilderMicroservices = require('../../../src/routers/route-builder-microservices.js');

const config = {
  microservices: [
    {
      path: '/get_microservice',
      name: 'A microservice',
      description: 'A microservice used for testing',
      serviceFile: 'statics.js',
    },
    {
      verb: 'OPTIONS',
      path: '/options_microservice',
      name: 'A microservice',
      description: 'A microservice used for testing',
      serviceFile: 'statics.js',
    },
    {
      verb: 'POST',
      path: '/post_microservice',
      name: 'A microservice',
      description: 'A microservice used for testing',
      serviceFile: 'statics.js',
    },
    {
      verb: 'PUT',
      path: '/put_microservice',
      name: 'A microservice',
      description: 'A microservice used for testing',
      serviceFile: 'statics.js',
    },
    {
      verb: 'PATCH',
      path: '/patch_microservice',
      name: 'A microservice',
      description: 'A microservice used for testing',
      serviceFile: 'statics.js',
    },
    {
      verb: 'DELETE',
      path: '/delete_microservice',
      name: 'A microservice',
      description: 'A microservice used for testing',
      serviceFile: 'statics.js',
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

describe('As a developer, I need to access microservic routes', () => {
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
    const routeBuilderMicroservices = new RouteBuilderMicroservices();
    const mockExpressRouter = new MockExpressRouter();
    let result = routeBuilderMicroservices.connect(null, null);
    expect(result).to.be.equal(false);
    result = routeBuilderMicroservices.connect({}, {});
    expect(result).to.be.equal(false);
    result = routeBuilderMicroservices.connect(mockExpressRouter, {});
    expect(result).to.be.equal(false);
    result = routeBuilderMicroservices.connect({}, config);
    expect(result).to.be.equal(false);
  });

  it('should be build routes to handlers based on config information', () => {
    const routeBuilderMicroservices = new RouteBuilderMicroservices();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderMicroservices.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(mockExpressRouter.option.length).to.be.equal(1);
    expect(mockExpressRouter.posts.length).to.be.equal(1);
    expect(mockExpressRouter.puts.length).to.be.equal(1);
    expect(mockExpressRouter.patches.length).to.be.equal(1);
    expect(mockExpressRouter.deletes.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.option, '/options_microservice')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/post_microservice')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.puts, '/put_microservice')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.patches, '/patch_microservice')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/delete_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.option, '/options_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/post_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.puts, '/put_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.patches, '/patch_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/delete_microservice')).to.be.equal(true);
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
      microservices: [
        {
          path: '/get_microservice',
          name: 'A microservice',
          description: 'A microservice used for testing',
          serviceFile: 'statics.js',
          authentication: 'local',
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderMicroservices = new RouteBuilderMicroservices();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderMicroservices.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
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
      microservices: [
        {
          path: '/get_microservice',
          name: 'A microservice',
          description: 'A microservice used for testing',
          serviceFile: 'statics.js',
          authorization: { strategy: 'local', groups: ['admin'] },
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderMicroservices = new RouteBuilderMicroservices();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderMicroservices.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
    expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.gets[0].handler.length).to.be.equal(3);
  });

  it('should support logging', () => {
    const config = {
      microservices: [
        {
          path: '/get_microservice',
          name: 'A microservice',
          description: 'A microservice used for testing',
          serviceFile: 'statics.js',
          logging: 'ALL',
        },
      ],
    };
    const routeBuilderMicroservices = new RouteBuilderMicroservices();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderMicroservices.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/get_microservice')).to.be.equal(true);
    expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.gets[0].handler.length).to.be.equal(4);
  });
});
