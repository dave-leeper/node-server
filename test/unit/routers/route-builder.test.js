
const chai = require('chai');

const { expect } = chai;

const passport = require('passport');
const Registry = require('../../../src/util/registry.js');
const RouteBuilder = require('../../../src/routers/route-builder.js');

describe('As a developer, I need to control the building of routes in the server.', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should not build authentication strategies if Passport is not in the Registry', () => {
    const config = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
    };
    const result = RouteBuilder.buildAuthenticationStrategies(config);
    expect(result).to.be.equal(false);
    expect(config.authenticationStrategies).to.be.undefined;
  });

  it('should not build authentication strategies without a config', () => {
    Registry.register(passport, 'Passport');
    const result = RouteBuilder.buildAuthenticationStrategies();
    expect(result).to.be.equal(false);
  });

  it('should build authentication strategies', () => {
    const config = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
    };
    Registry.register(passport, 'Passport');
    const result = RouteBuilder.buildAuthenticationStrategies(config);
    expect(result).to.be.equal(true);
    expect(config.authenticationStrategies).not.to.be.undefined;
    expect(config.authenticationStrategies.local).not.to.be.undefined;
    expect(config.authenticationStrategies.local.name).to.be.equal('local');
    expect(config.authenticationStrategies.local.strategy).not.to.be.undefined;
    expect(config.authenticationStrategies.local.strategy).not.to.be.null;
    expect(config.authenticationStrategies.local.config).to.be.equal(config.authentication[0].config);
  });
});
