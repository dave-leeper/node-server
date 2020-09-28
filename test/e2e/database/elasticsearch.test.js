// @formatter:off

const fs = require('fs');
const path = require('path');
const chai = require('chai');

const { expect } = chai;
const request = require('request');
const ElasticSearch = require('../../../src/database/elasticsearch.js');
const Server = require('../../../server.js');
const Registry = require('../../../src/util/registry.js');

const elasticSearch = new ElasticSearch();
const port = 1337;
const server = new Server();
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
        host: '127.0.0.1:9200',
        log: 'trace',
      },
    },
  ],
};
const configInfo = {
  name: 'elasticsearch',
  type: 'elasticsearch',
  description: 'Elasticsearch service.',
  databaseConnector: 'elasticsearch.js',
  config: {
    host: '127.0.0.1:9200',
    log: 'trace',
  },
};
const schema = {
  index: 'test',
  type: 'document',
  body: {
    properties: {
      title: { type: 'text' },
      content: { type: 'text' },
      suggest: {
        type: 'completion',
        analyzer: 'simple',
        search_analyzer: 'simple',
      },
    },
  },
};
const data = {
  body: {
    title: 'my title',
    content: 'my content',
    suggest: 'my suggest',
  },
  id: 1,
  type: 'document',
  index: 'test',
};
const updateData = {
  body: {
    doc: {
      title: 'my updated title',
      content: 'my updated content',
      suggest: 'my updated suggest',
    },
  },
  id: 1,
  type: 'document',
  index: 'test',
};
const query = {
  index: 'test',
  q: 'title:\'my title\'',
};
const query2 = {
  index: 'test',
  q: 'title:\'my updated title\'',
};
describe.skip('As a developer, I need to connect, ping, and disconnect to/from elasticsearch.', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
  });
  it('should be able to connect, ping, and disconnect the elasticsearch connection', (done) => {
    elasticSearch.connect(configInfo.config).then(() => {
      elasticSearch.ping().then((pingResult) => {
        expect(pingResult).to.be.equal(true);
        elasticSearch.disconnect().then(() => {
          elasticSearch.ping().then((pingResult2) => {
            expect(pingResult2).to.be.equal(false);
            done();
          });
        });
      });
    });
  });
});

describe.skip('As a developer, I need to create, check for the existence of, and drop elasticsearch indexes.', () => {
  before((done) => {
    elasticSearch.connect(configInfo.config).then(() => {
      done();
    });
  });
  beforeEach((done) => {
    Registry.unregisterAll();
    elasticSearch.indexExists(schema.index).then((exits) => {
      if (!exits) done();
      else {
        elasticSearch.dropIndex(schema.index).then(() => {
          done();
        });
      }
    });
  });
  afterEach(() => {
  });
  after((done) => {
    elasticSearch.disconnect().then(() => {
      done();
    });
  });

  it('should not create indexes (tables) with invalid elasticsearch mappings.', (done) => {
    const invalidSchema = { index: 'test', type: '', body: { properties: { title: { type: 'string' } } } };
    elasticSearch.createIndex(invalidSchema).then((createResult) => {
      expect(createResult.status).to.be.equal(true);
      elasticSearch.createIndexMapping(invalidSchema).then((createResult) => {
        expect(false).to.be.equal(true);
      }, (error) => {
        done();
      });
    }, (error) => {
      expect(false).to.be.equal(true);
    });
  }).timeout(4000);

  it('should create indexes (tables) with valid elasticsearch mappings.', (done) => {
    elasticSearch.createIndex(schema).then((createResult) => {
      expect(createResult.status).to.be.equal(true);
      elasticSearch.createIndexMapping(schema).then((createResult) => {
        expect(createResult.status).to.be.equal(true);
        done();
      }, (error) => {
        expect(false).to.be.equal(true);
        done();
      });
    }, (error) => {
      expect(false).to.be.equal(true);
      done();
    });
  });

  it('should be able to to tell when an index does not exist in elasticsearch.', (done) => {
    elasticSearch.indexExists('JUNK').then((existsResult) => {
      expect(existsResult).to.be.equal(false);
      done();
    });
  });

  it('should not delete indexes that do not existing elasticsearch.', (done) => {
    elasticSearch.dropIndex('JUNK').then((dropResult) => {
      expect(true).to.be.equal(false);
    }, (error) => {
      expect(error.status).to.be.equal(false);
      done();
    });
  });

  it('should be able to create an index in elasticsearch', (done) => {
    elasticSearch.createIndex(schema).then((createResult) => {
      expect(createResult.status).to.be.equal(true);
      elasticSearch.indexExists(schema.index).then((existsResult2) => {
        expect(existsResult2).to.be.equal(true);
        done();
      });
    });
  });

  it('should not create indexes that already exist in elasticsearch.', (done) => {
    elasticSearch.createIndex(schema).then((createResult) => {
      expect(createResult.status).to.be.equal(true);
      elasticSearch.createIndex(schema).then((createResult2) => {
        expect(true).to.be.equal(false);
      }, (error) => {
        done();
      });
    });
  }).timeout(5000);
});
describe.skip('As a developer, I need to perform CRUD operations on the elasticsearch database.', () => {
  before((done) => {
    elasticSearch.connect(configInfo.config).then(() => {
      done();
    });
  });
  beforeEach((done) => {
    Registry.unregisterAll();
    elasticSearch.indexExists(schema.index).then((exits) => {
      if (exits) return done();
      elasticSearch.createIndex(schema).then(() => {
        elasticSearch.createIndexMapping(schema).then(() => {
          done();
        });
      });
    });
  });
  afterEach((done) => {
    elasticSearch.indexExists(schema.index).then((exits) => {
      if (!exits) return done();
      elasticSearch.dropIndex(schema.index).then(() => {
        done();
      });
    });
  });
  after((done) => {
    elasticSearch.disconnect().then(() => {
      done();
    });
  });
  it('should be able to insert records into the elasticsearch database.', (done) => {
    elasticSearch.insert(data).then((result) => {
      expect(result._index).to.be.equal('test');
      expect(result._type).to.be.equal('document');
      expect(result._id).to.be.equal('1');
      expect(result._version).to.be.equal(1);
      expect(result.result).to.be.equal('created');
      done();
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
  it('should be able to query records in the elasticsearch database.', (done) => {
    elasticSearch.insert(data).then((result) => {
      expect(result._index).to.be.equal('test');
      expect(result._type).to.be.equal('document');
      expect(result._id).to.be.equal('1');
      expect(result._version).to.be.equal(1);
      expect(result.result).to.be.equal('created');
      elasticSearch.read(query).then((result2) => {
        expect(result2.hits).to.not.be.null;
        expect(Array.isArray(result2.hits.hits)).to.be.equal(true);
        expect(result2.hits.hits.length).to.be.equal(1);
        expect(result2.hits.hits[0]).to.not.be.null;
        expect(result2.hits.hits[0]._source).to.not.be.null;
        expect(result2.hits.hits[0]._source.title).to.be.equal('my title');
        expect(result2.hits.hits[0]._source.content).to.be.equal('my content');
        expect(result2.hits.hits[0]._source.suggest).to.be.equal('my suggest');
        done();
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should be able to update records in the elasticsearch database.', (done) => {
    elasticSearch.insert(data).then((result) => {
      elasticSearch.update(updateData).then((result2) => {
        expect(result2.result).to.be.equal('updated');
        elasticSearch.read(query2).then((result3) => {
          expect(result3.hits).to.not.be.null;
          expect(Array.isArray(result3.hits.hits)).to.be.equal(true);
          expect(result3.hits.hits.length).to.be.equal(1);
          expect(result3.hits.hits[0]).to.not.be.null;
          expect(result3.hits.hits[0]._source).to.not.be.null;
          expect(result3.hits.hits[0]._source.title).to.be.equal('my updated title');
          expect(result3.hits.hits[0]._source.content).to.be.equal('my updated content');
          expect(result3.hits.hits[0]._source.suggest).to.be.equal('my updated suggest');
          done();
        }, (error) => {
          expect(true).to.be.equal(false);
        });
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  }).timeout(4000);
  it('should be able to delete records in the elasticsearch database.', (done) => {
    elasticSearch.insert(data).then((result) => {
      elasticSearch.delete(data).then((result2) => {
        expect(result2.result).to.be.equal('deleted');
        elasticSearch.read(query).then((result3) => {
          expect(result3.hits).to.not.be.null;
          expect(Array.isArray(result3.hits.hits)).to.be.equal(true);
          expect(result3.hits.hits.length).to.be.equal(0);
          done();
        }, (error) => {
          expect(true).to.be.equal(false);
        });
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
});

describe.skip('As a developer, I need work with a Elasticsearch database using a REST interface', () => {
  let schemaFile;
  before(() => {
    schemaFile = path.resolve('./test/data', 'elasticsearch-schema.json');
  });
  beforeEach((done) => {
    const createIndexAndMapping = () => {
      let url = `http://localhost:${port}/elasticsearch/index`;
      let schemaData = { filename: fs.createReadStream(schemaFile) };
      request.post({ url, formData: schemaData }, (err, httpResponse, body) => {
        url = `http://localhost:${port}/elasticsearch/index/mapping`;
        schemaData = { filename: fs.createReadStream(schemaFile) };
        request.post({ url, formData: schemaData }, (err, httpResponse, body) => done());
      });
    };
    Registry.unregisterAll();
    server.init(port, config, () => {
      let url = `http://localhost:${port}/elasticsearch/connection/connect`;
      request(url, (err, res, body) => {
        url = `http://localhost:${port}/elasticsearch/index/test/exists`;
        request(url, (err, res, body) => {
          const bodObj = JSON.parse(body);
          if (!bodObj.exists) return createIndexAndMapping();
          url = `http://localhost:${port}/elasticsearch/index/test`;
          request.del(url, (err, res, body) => createIndexAndMapping());
        });
      });
    });
  });
  afterEach((done) => {
    const url = `http://localhost:${port}/elasticsearch/index/test`;
    request.del(url, (err, res, body) => {
      server.stop(() => {
        done();
      });
    });
  });
  after(() => {
    Registry.unregisterAll();
  });
  it('should insert into the database and use url query parameters as elasticsearch query parameters', (done) => {
    const sourceFile = path.resolve('./test/data', 'elasticsearch-insert.json');
    const formData = { filename: fs.createReadStream(sourceFile) };
    let url = `http://localhost:${port}/elasticsearch/data`;
    request.post({ url, formData }, (err, httpResponse, body) => {
      expect(body).to.be.equal('{"status":"success","operation":"Insert data to test/document."}');
      url = `http://localhost:${port}/elasticsearch/data/test/document/_all`;
      url += '?title=my+title&content=my+content';
      request(url, (err, httpResponse, body) => {
        const bodyObj = JSON.parse(body);
        expect(bodyObj.status).to.be.equal('success');
        expect(bodyObj.data.length).to.be.equal(1);
        expect(bodyObj.data[0].title).to.be.equal('my title');
        expect(bodyObj.data[0].content).to.be.equal('my content');
        expect(bodyObj.data[0].suggest).to.be.equal('my suggest');
        done();
      });
    });
  }).timeout(6000);
  it('should update data in the database', (done) => {
    const sourceFile = path.resolve('./test/data', 'elasticsearch-insert.json');
    const formData = { filename: fs.createReadStream(sourceFile) };
    const sourceFile2 = path.resolve('./test/data', 'elasticsearch-update.json');
    const formData2 = { filename: fs.createReadStream(sourceFile2) };
    let url = `http://localhost:${port}/elasticsearch/data`;
    request.post({ url, formData }, (err, httpResponse, body) => {
      expect(body).to.be.equal('{"status":"success","operation":"Insert data to test/document."}');
      url = `http://localhost:${port}/elasticsearch/data/update`;
      url += '?title=my+title&content=my+content';
      request.post({ url, formData: formData2 }, (err, httpResponse, body) => {
        let bodyObj = JSON.parse(body);
        expect(bodyObj.status).to.be.equal('success');
        url = `http://localhost:${port}/elasticsearch/data/test/document/1`;
        request(url, (err, httpResponse, body) => {
          bodyObj = JSON.parse(body);
          expect(bodyObj.status).to.be.equal('success');
          expect(bodyObj.data.length).to.be.equal(1);
          expect(bodyObj.data[0].title).to.be.equal('my updated title');
          expect(bodyObj.data[0].content).to.be.equal('my updated content');
          expect(bodyObj.data[0].suggest).to.be.equal('my updated suggest');
          done();
        });
      });
    });
  });
  it('should delete data in the database', (done) => {
    const sourceFile = path.resolve('./test/data', 'elasticsearch-insert.json');
    const formData = { filename: fs.createReadStream(sourceFile) };
    let url = `http://localhost:${port}/elasticsearch/data`;
    request.post({ url, formData }, (err, httpResponse, body) => {
      expect(body).to.be.equal('{"status":"success","operation":"Insert data to test/document."}');
      url = `http://localhost:${port}/elasticsearch/data/test/document/1`;
      request.del({ url }, (err, httpResponse, body) => {
        let bodyObj = JSON.parse(body);
        expect(bodyObj.status).to.be.equal('success');
        url = `http://localhost:${port}/elasticsearch/data/test/document/1`;
        request(url, (err, httpResponse, body) => {
          bodyObj = JSON.parse(body);
          expect(bodyObj.status).to.be.equal('success');
          expect(bodyObj.data.length).to.be.equal(0);
          done();
        });
      });
    });
  });
});
