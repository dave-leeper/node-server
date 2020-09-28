/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-console */
// @formatter:off

const fs = require('fs');
const path = require('path');
const chai = require('chai');

const { expect } = chai;
const request = require('request');
const MongoDB = require('../../../src/database/mongodb.js');
const Server = require('../../../server.js');
const Registry = require('../../../src/util/registry.js');

const mongodb = new MongoDB();
const testCollection = 'testCollection';
const port = 1337;
const server = new Server();
const config = {
  databaseConnections: [
    {
      name: 'mongo',
      type: 'mongo',
      description: 'Mongo service.',
      databaseConnector: 'mongodb.js',
      generateMongoConnectionAPI: true,
      generateMongoCollectionAPI: true,
      generateMongoDataAPI: true,
      config: {
        url: 'mongodb://localhost:27017',
        db: 'testdb',
        collections: {
          testCollection: { w: 0 },
        },
      },
      cookies: [{ name: 'MY_COOKIE1', value: 'MY_COOKIE_VALUE1' }],
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
    },
  ],
};
const configInfo = {
  name: 'mongodb',
  type: 'mongo',
  description: 'MongoDB service.',
  databaseConnector: 'mongodb.js',
  config: {
    url: 'mongodb://localhost:27017',
    db: 'testdb',
    collections: {
      testCollection: { w: 0 },
    },
  },
};
const data = {
  title: 'my title',
  content: 'my content',
  suggest: 'my suggest',
};
const updateData = {
  title: 'my updated title',
  content: 'my updated content',
  suggest: 'my updated suggest',
};
const query = {
  title: 'my title',
};
describe.skip('As a developer, I need to connect, ping, and disconnect to/from mongodb.', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
  });
  it('should be able to connect, ping, and disconnect the connection', (done) => {
    mongodb.connect(configInfo.config).then(() => {
      mongodb.ping().then((pingResult) => {
        expect(pingResult).to.be.equal(true);
        mongodb.disconnect().then(() => {
          mongodb.ping().then((pingResult2) => {
            expect(pingResult2).to.be.equal(false);
            done();
          });
        }).catch((err) => {
          expect(false).to.be.equal(true);
        });
      });
    });
  });
});

describe.skip('As a developer, I need to create, check for the existence of, and drop mongodb collections.', () => {
  before((done) => {
    mongodb.connect(configInfo.config).then(() => {
      done();
    });
  });
  beforeEach((done) => {
    Registry.unregisterAll();
    mongodb.collectionExists(testCollection).then((exits) => {
      if (!exits) done();
      else {
        mongodb.dropCollection(testCollection).then(() => {
          done();
        });
      }
    });
  });
  afterEach(() => {
  });
  after((done) => {
    mongodb.disconnect().then(() => {
      done();
    });
  });

  it('should create collections (tables).', (done) => {
    mongodb.createCollection(testCollection).then((createResult) => {
      expect(createResult.status).to.be.equal(true);
      done();
    }, (error) => {
      expect(false).to.be.equal(true);
    });
  });

  it('should be able to to tell when a collection exists.', (done) => {
    mongodb.createCollection(testCollection).then((createResult) => {
      expect(createResult.status).to.be.equal(true);
      mongodb.collectionExists(testCollection).then((existsResult) => {
        expect(existsResult).to.be.equal(true);
        done();
      });
    }, (error) => {
      expect(false).to.be.equal(true);
    });
  });

  it('should be able to to tell when a collection does not exist.', (done) => {
    mongodb.collectionExists('JUNK').then((existsResult) => {
      expect(existsResult).to.be.equal(false);
      done();
    });
  });

  it('should drop collections.', (done) => {
    mongodb.createCollection(testCollection).then((createResult) => {
      expect(createResult.status).to.be.equal(true);
      mongodb.dropCollection(testCollection).then((dropResult) => {
        expect(dropResult.status).to.be.equal(true);
        done();
      }, (error) => {
        expect(false).to.be.equal(true);
      });
    });
  });

  it('should not drop collections that dont exist.', (done) => {
    mongodb.dropCollection('JUNK').then((dropResult) => {
      expect(false).to.be.equal(true);
    }, (error) => {
      expect(error.status).to.be.equal(false);
      done();
    });
  });
});

describe.skip('As a developer, I need to perform CRUD operations on the mongodb database.', () => {
  before((done) => {
    mongodb.connect(configInfo.config).then(() => {
      done();
    });
  });
  beforeEach((done) => {
    Registry.unregisterAll();
    mongodb.collectionExists(testCollection).then((exits) => {
      if (exits) return done();
      mongodb.createCollection(testCollection).then(() => {
        done();
      });
    });
  });
  afterEach((done) => {
    mongodb.collectionExists(testCollection).then((exits) => {
      if (!exits) return done();
      mongodb.dropCollection(testCollection).then(() => {
        done();
      });
    });
  });
  after((done) => {
    mongodb.disconnect().then(() => {
      done();
    });
  });
  it('should be able to insert records into the database.', (done) => {
    mongodb.insert(testCollection, data).then((result) => {
      expect(result.status).to.be.equal(true);
      done();
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
  it('should be able to query records in the database.', (done) => {
    mongodb.insert(testCollection, data).then((result) => {
      mongodb.read(testCollection, query).then((result) => {
        expect(result).to.not.be.null;
        expect(Array.isArray(result)).to.be.equal(true);
        expect(result.length).to.be.equal(1);
        expect(result[0]._id).to.not.be.null;
        expect(result[0].title).to.be.equal('my title');
        expect(result[0].content).to.be.equal('my content');
        expect(result[0].suggest).to.be.equal('my suggest');
        done();
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
  it('should be able to update records in the database.', (done) => {
    mongodb.insert(testCollection, data).then((result) => {
      mongodb.update(testCollection, query, updateData).then((result) => {
        expect(result.status).to.be.equal(true);
        done();
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
  it('should be able to delete records in the database.', (done) => {
    mongodb.insert(testCollection, data).then((result) => {
      mongodb.delete(testCollection, data).then((result) => {
        expect(result.status).to.be.equal(true);
        done();
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
});

describe.skip('As a developer, I need work with a Mongo database using a REST interface', () => {
  before(() => {
  });
  beforeEach((done) => {
    Registry.unregisterAll();
    server.init(port, config, () => {
      let url = `http://localhost:${port}/mongo/connection/connect`;
      request(url, (err, res, body) => {
        url = `http://localhost:${port}/mongo/collection/test/exists`;
        request(url, (err, res, body) => {
          const bodObj = JSON.parse(body);
          if (!bodObj.exists) return done();
          url = `http://localhost:${port}/mongo/collection/test`;
          request.del(url, (err, res, body) => {
            done();
          });
        });
      });
    });
  });
  afterEach((done) => {
    const url = `http://localhost:${port}/mongo/collection/test`;
    request.del(url, (err, res, body) => {
      server.stop(() => {
        done();
      });
    });
  });
  after(() => {
    Registry.unregisterAll();
  });
  it('should insert into the database and use url query parameters as mongo query parameters', (done) => {
    const sourceFile = path.resolve('./test/data', 'mongo-insert.json');
    const formData = { filename: fs.createReadStream(sourceFile) };
    let url = `http://localhost:${port}/mongo/data/test`;
    request.post({ url, formData }, (err, httpResponse, body) => {
      expect(body).to.be.equal('{"status":"success","operation":"Insert data to test."}');
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
  });
  it('should update data in the database', (done) => {
    const sourceFile = path.resolve('./test/data', 'mongo-insert.json');
    const formData = { filename: fs.createReadStream(sourceFile) };
    const sourceFile2 = path.resolve('./test/data', 'mongo-update.json');
    const formData2 = { filename: fs.createReadStream(sourceFile2) };
    let url = `http://localhost:${port}/mongo/data/test`;
    request.post({ url, formData }, (err, httpResponse, body) => {
      expect(body).to.be.equal('{"status":"success","operation":"Insert data to test."}');
      url += '?title=my+title&content=my+content';
      request.put({ url, formData: formData2 }, (err, httpResponse, body) => {
        let bodyObj = JSON.parse(body);
        expect(bodyObj.status).to.be.equal('success');
        url = `http://localhost:${port}/mongo/data/test`;
        url += '?title=my+title+updated&content=my+content+updated';
        request(url, (err, httpResponse, body) => {
          bodyObj = JSON.parse(body);
          expect(bodyObj.status).to.be.equal('success');
          expect(bodyObj.data.length).to.be.equal(1);
          expect(bodyObj.data[0].title).to.be.equal('my title updated');
          expect(bodyObj.data[0].content).to.be.equal('my content updated');
          expect(bodyObj.data[0].suggest).to.be.equal('my suggest updated');
          done();
        });
      });
    });
  });
  it('should delete data in the database', (done) => {
    const sourceFile = path.resolve('./test/data', 'mongo-insert.json');
    const formData = { filename: fs.createReadStream(sourceFile) };
    let url = `http://localhost:${port}/mongo/data/test`;
    request.post({ url, formData }, (err, httpResponse, body) => {
      expect(body).to.be.equal('{"status":"success","operation":"Insert data to test."}');
      url += '?title=my+title&content=my+content';
      request.del({ url }, (err, httpResponse, body) => {
        let bodyObj = JSON.parse(body);
        expect(bodyObj.status).to.be.equal('success');
        url = `http://localhost:${port}/mongo/data/test`;
        url += '?title=my+title&content=my+content';
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
