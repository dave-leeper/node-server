/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */

const path = require('path');
const RouteBuilderStatics = require('./route-builder-statics.js');
const RouteBuilderMicroservices = require('./route-builder-microservices.js');
const RouteBuilderEndpoints = require('./route-builder-endpoints.js');
const RouteBuilderElasticsearchDatabase = require('./route-builder-elasticsearch-database.js');
const RouteBuilderGithubDatabase = require('./route-builder-github-database.js');
const RouteBuilderMongoDatabase = require('./route-builder-mongo-database.js');
const Registry = require('../util/registry.js');
const Strings = require('../util/strings.js');
const I18n = require('../util/i18n.js');
const Log = require('../util/log.js');

class RouteBuilder {
  /**
     * @param router - Express router. This method will add routers to it.
     * @param config - The configure file for the server.
     * @param databaseConnectionCallback - Called if database connections are made. The callback
     * will be passed the promises from creating all database connections.
     * @returns Returns the express router.
     */
  static connect(router, config, databaseConnectionCallback) {
    if ((!config) || (!router)) return router;

    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderStatics = new RouteBuilderStatics();
    routeBuilderStatics.connect(router, config);

    const routeBuilderMicroservices = new RouteBuilderMicroservices();
    routeBuilderMicroservices.connect(router, config);

    const routeBuilderEndpoints = new RouteBuilderEndpoints();
    routeBuilderEndpoints.connect(router, config);

    const routeBuilderElasticsearchDatabase = new RouteBuilderElasticsearchDatabase();
    routeBuilderElasticsearchDatabase.connect(router, config, databaseConnectionCallback);

    const routeBuilderMongoDatabase = new RouteBuilderMongoDatabase();
    routeBuilderMongoDatabase.connect(router, config, databaseConnectionCallback);

    const routeBuilderGithubDatabase = new RouteBuilderGithubDatabase();
    routeBuilderGithubDatabase.connect(router, config, databaseConnectionCallback);

    return router;
  }

  static buildAuthenticationStrategies(config) {
    if (!config || !config.authentication) return false;
    const operation = 'RouterBuilder.buildAuthenticationStrategies';
    const passport = Registry.get('Passport');
    if (!passport) {
      const err = {
        operation, statusType: 'error', status: 501, message: I18n.get(Strings.ERROR_MESSAGE_AUTHENTICATION_NOT_CONFIGURED),
      };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(err));
      return false;
    }
    config.authenticationStrategies = {};
    for (let loop = 0; loop < config.authentication.length; loop++) {
      const authentication = config.authentication[loop];
      const strategyFile = path.resolve('./src/authentication', authentication.strategyFile);
      authentication.strategy = new (require(strategyFile))();
      passport.use(authentication.strategy.getAuthentication());
      config.authenticationStrategies[authentication.name] = {};
      config.authenticationStrategies[authentication.name].name = authentication.name;
      config.authenticationStrategies[authentication.name].strategy = authentication.strategy;
      config.authenticationStrategies[authentication.name].config = authentication.config;
      config.authenticationStrategies[authentication.name].groups = authentication.groups;
    }
    return true;
  }
}

module.exports = RouteBuilder;
