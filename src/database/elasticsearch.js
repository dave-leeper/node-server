const elasticsearch = require('elasticsearch');
const Log = require('../util/log.js');

/**
 * Database = N/A
 * Table Definition = Mapping
 * Table = Index/Type
 * @param name - name of the connection.
 * @constructor
 */
function Elasticsearch(name) {
  this.name = name;
  this.client = null;
  this.config = null;
}

// https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html
Elasticsearch.prototype.connect = function (config) {
  return new Promise((inResolve, inReject) => {
    // Elasticsearch mangles configs, so copy it.
    const configCopy = { ...config };
    try {
      this.client = new elasticsearch.Client(configCopy);
      this.config = config;
      inResolve && inResolve(this.client);
    } catch (err) {
      const error = { status: false, error: 'Elasticsearch: Error while connecting.' };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
      inReject && inReject(error);
    }
  });
};

Elasticsearch.prototype.ping = function () {
  return new Promise((inResolve, inReject) => {
    if (!this.client) {
      const error = { status: 'Error', error: 'Null client.' };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
      inReject && inReject(error);
    } else {
      this.client.ping({ requestTimeout: 30000 }, (error) => {
        if (error) {
          inResolve && inResolve(false);
        } else {
          inResolve && inResolve(true);
        }
      });
    }
  });
};

Elasticsearch.prototype.disconnect = function () {
  return new Promise((inResolve, inReject) => {
    if (!this.client) {
      const error = { status: false, error: 'Null client.' };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
      inReject && inReject(error);
    } else {
      try {
        this.client.close();
        inResolve && inResolve(true);
      } catch (err) {
        const error = { status: false, error: 'Error while disconnecting.' };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject(error);
      }
    }
  });
};

Elasticsearch.prototype.indexExists = function (name) {
  return new Promise((inResolve, inReject) => {
    this.client.indices.exists({ index: name }).then((exists) => {
      inResolve && inResolve(exists);
    }, () => {
      const error = { status: false, error: 'Error while checking table.' };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
      inReject && inReject(error);
    });
  });
};

/**
 * @param index - An object that describes the index. Example:
 * {
 *     index: "test"
 * }
 * @returns {Promise}
 */
Elasticsearch.prototype.createIndex = function (index) {
  return new Promise((inResolve, inReject) => {
    this.client.indices.create({ index: index.index }).then(() => {
      inResolve && inResolve({ status: true });
    }, () => {
      const error = { status: false, error: 'Could not create index.' };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
      inReject && inReject(error);
    });
  });
};

Elasticsearch.prototype.dropIndex = function (name) {
  return new Promise((inResolve, inReject) => {
    this.client.indices.delete({ index: name }).then((success) => {
      inResolve && inResolve(success);
    }, (err) => {
      const error = { status: false, error: err };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
      inReject && inReject(error);
    });
  });
};

/**
 * @param mapping - An object that describes the index mapping. Example:
 * {
 *     index: "test",
 *     type: "document",
 *     body: {
 *         properties: {
 *             title: { type: "string" },
 *             content: { type: "string" },
 *             suggest: {
 *                 type: "completion",
 *                 analyzer: "simple",
 *                 search_analyzer: "simple"
 *             }
 *         }
 *     }
 * }
 * @returns {Promise}
 */
Elasticsearch.prototype.createIndexMapping = function (mapping) {
  return new Promise((inResolve, inReject) => {
    this.client.indices.putMapping(mapping).then(() => {
      inResolve && inResolve({ status: true });
    }).catch((err) => {
      const error = { status: false, error: `Could not create index mapping.${err}` };
      if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
      inReject && inReject(error);
    });
  });
};

Elasticsearch.prototype.insert = function (data) {
  return new Promise((inResolve, inReject) => {
    // eslint-disable-next-line no-param-reassign
    data.refresh = 'wait_for';
    this.client.index(data, (err, response) => {
      if (err) {
        const error = { status: false, error: err };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject(error);
        return;
      }
      inResolve && inResolve(response);
    });
  });
};

Elasticsearch.prototype.update = function (data) {
  return new Promise((inResolve, inReject) => {
    // eslint-disable-next-line no-param-reassign
    data.refresh = 'wait_for';
    this.client.update(data, (err, response) => {
      if (err) {
        const error = { status: false, error: err };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject(error);
        return;
      }
      inResolve && inResolve(response);
    });
  });
};

Elasticsearch.prototype.delete = function (data) {
  return new Promise((inResolve, inReject) => {
    // eslint-disable-next-line no-param-reassign
    data.refresh = 'wait_for';
    this.client.delete(data)
      .then((success) => { inResolve && inResolve(success); })
      .catch((err) => {
        const error = { status: false, error: err };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject(error);
      });
  });
};

Elasticsearch.prototype.read = function (whereClause) {
  return new Promise((inResolve, inReject) => {
    this.client.search(whereClause, (err, response) => {
      if (err) {
        const error = { status: false, error: err };
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject(error);
        return;
      }
      inResolve && inResolve(response);
    });
  });
};

module.exports = Elasticsearch;
