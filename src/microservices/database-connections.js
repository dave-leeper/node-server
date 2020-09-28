const Log = require('../util/log');
const Registry = require('../util/registry');
const RouteBuilderElasticsearchDatabase = require('../routers/route-builder-elasticsearch-database');
const RouteBuilderMongoDatabase = require('../routers/route-builder-mongo-database');

class DatabaseConnections {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const serverConfig = Registry.get('ServerConfig');
      if ((!serverConfig) || (!serverConfig.databaseConnections)) {
        const error = 'Error looking up database connections.';
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject({ status: 500, send: error });
        return;
      }
      if (serverConfig.databaseConnections.length === 0) {
        inResolve && inResolve({ status: 200, send: 'There are no database connections.' });
        return;
      }
      const result = [];
      const { databaseConnections } = serverConfig;
      for (let loop = 0; loop < databaseConnections.length; loop++) {
        const databaseConnection = databaseConnections[loop];
        if (!databaseConnection.type) {
          const error = 'Error parsing database config. No database type given.';
          if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
          inReject && inReject({ status: 500, send: error });
          return;
        }
        result.push({
          name: databaseConnection.name,
          description: databaseConnection.description,
        });
      }
      inResolve && inResolve({ status: 200, send: Log.stringify(result) });
    });
  }
}
module.exports = DatabaseConnections;
