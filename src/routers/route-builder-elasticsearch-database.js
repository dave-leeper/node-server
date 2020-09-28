/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const path = require('path');
const ServiceBase = require('../util/service-base.js');
const DatabaseConnectorManager = require('../database/database-connection-manager');
const Registry = require('../util/registry.js');

const SOURCE_PATH = './src/routers/data-route-builders/elasticsearch/';

class RouteBuilderElasticsearchDatabase extends ServiceBase {
  /**
     * @param router - Express router. This method will add routers to it.
     * @param config - The configure file for the server.
     * @param databaseConnectionCallback - Called if database connections are made. The callback
     * will be passed the promises from creating all database connections.
     */
  connect(router, config, databaseConnectionCallback) {
    if (!router || !router.get || !router.put || !router.post || !router.patch || !router.delete || !router.options) return false;
    if (!config || !config.databaseConnections) return false;
    const databaseConnectionManager = new DatabaseConnectorManager();
    Registry.register(databaseConnectionManager, 'DatabaseConnectorManager');
    const databaseConnectionPromises = databaseConnectionManager.connect(config);

    databaseConnectionCallback && databaseConnectionCallback(databaseConnectionPromises);
    return true;
  }
}

module.exports = RouteBuilderElasticsearchDatabase;
