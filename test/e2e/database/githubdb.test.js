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
const GithubDB = require('../../../src/database/githubdb.js');
const Server = require('../../../server.js');
const Registry = require('../../../src/util/registry.js');

const crypto = {
  key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
  iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
};
Registry.register(crypto, 'Crypto');
const githubdb = new GithubDB();
const testCollection = 'testCollection';
const port = 1337;
const server = new Server();
const config = {
  databaseConnections: [
    {
      name: 'github',
      description: 'Github service.',
      databaseConnector: 'githubdb.js',
      factory: 'github-factory.js',
      config: {
        owner: 'dave-leeper',
        repo: 'HERO-server-db',
        committer: { name: 'dave-leeper', email: 'magicjtv@gmail.com' },
        author: { name: 'dave-leeper', email: 'magicjtv@gmail.com' },
      },
    },
  ],
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

describe('As a developer, I need to connect, ping, and disconnect to/from githubdb.', () => {
  before(() => {
  });
  beforeEach(async () => {
    Registry.unregisterAll();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const collectionExists = await githubdb.collectionExists(testCollection);
    if (collectionExists) {
      await githubdb.dropCollection(testCollection);
    }
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should be able to connect, ping, and disconnect the connection', (done) => {
    githubdb.connect(config.databaseConnections[0]).then(() => {
      githubdb.ping().then((pingResult) => {
        expect(pingResult).to.be.equal(true);
        githubdb.disconnect().then(() => {
          githubdb.ping().then((pingResult2) => {
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

describe('As a developer, I need to create, check for the existence of, and drop githubdb collections.', () => {
  before((done) => {
    githubdb.connect(config.databaseConnections[0]).then(() => {
      done();
    });
  });
  beforeEach(async function () {
    this.timeout(10000);
    Registry.unregisterAll();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const collectionExists = await githubdb.collectionExists(testCollection);
    if (collectionExists) {
      await githubdb.dropCollection(testCollection);
    }
  });
  afterEach(() => {
  });
  after((done) => {
    githubdb.disconnect().then(() => {
      done();
    });
  });

  it('should create collections (directories).', async () => {
    try {
      const createResult = await githubdb.createCollection(testCollection);
      expect(createResult.status).to.be.equal(true);
    } catch (err) {
      expect(false).to.be.equal(true);
    }
  });

  it('should be able to to tell when a collection exists.', async () => {
    try {
      const createResult = await githubdb.createCollection(testCollection);
      expect(createResult.status).to.be.equal(true);
      const existsResult = await githubdb.collectionExists(testCollection);
      expect(existsResult).to.be.equal(true);
    } catch (err) {
      expect(false).to.be.equal(true);
    }
  }).timeout(10000);

  it('should be able to to tell when a collection does not exist.', async () => {
    try {
      const existsResult = await githubdb.collectionExists('JUNK');
      expect(existsResult).to.be.equal(false);
    } catch (err) {
      expect(false).to.be.equal(true);
    }
  });

  it('should drop collections.', async () => {
    try {
      const createResult = await githubdb.createCollection(testCollection);
      expect(createResult.status).to.be.equal(true);
      const dropResult = await githubdb.dropCollection(testCollection);
      expect(dropResult.status).to.be.equal(true);
    } catch (error) {
      expect(false).to.be.equal(true);
    }
  }).timeout(10000);

  it('should not drop collections that dont exist.', async () => {
    try {
      const dropResult = await githubdb.dropCollection('JUNK');
      expect(false).to.be.equal(true);
    } catch (error) {
      expect(error.status).to.be.equal(false);
    }
  });
});

describe('As a developer, I need to perform CRUD operations on the githubdb database.', () => {
  before((done) => {
    githubdb.connect(config.databaseConnections[0]).then(() => {
      done();
    });
  });
  beforeEach(async function () {
    this.timeout(10000);
    Registry.unregisterAll();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const exists = await githubdb.collectionExists(testCollection);
    if (!exists) {
      await githubdb.createCollection(testCollection);
    }
  });
  afterEach(async function () {
    this.timeout(10000);
    const exists = await githubdb.collectionExists(testCollection);
    if (exists) {
      await githubdb.dropCollection(testCollection);
    }
  });
  after((done) => {
    githubdb.disconnect().then(() => {
      done();
    });
  });

  it('should be able to insert records into the database.', (done) => {
    githubdb.upsert(`${testCollection}/MyFile`, JSON.stringify(data))
      .then((result) => {
        expect(result.status).to.be.equal(true);
        done();
      })
      .catch((error) => {
        expect(true).to.be.equal(false);
      });
  }).timeout(10000);

  it('should be able to read records in the database.', async () => {
    await githubdb.upsert(`${testCollection}/MyFile`, JSON.stringify(data));
    const savedData = await githubdb.read(`${testCollection}/MyFile`);
    expect(savedData).to.be.equal(JSON.stringify(data));
  }).timeout(10000);

  it('should be able to update records in the database.', (done) => {
    githubdb.upsert(`${testCollection}/MyFile`, JSON.stringify(data))
      .then((result) => {
        githubdb.update(`${testCollection}/MyFile`, JSON.stringify(updateData))
          .then((result) => {
            expect(result.status).to.be.equal(true);
            done();
          })
          .catch((error) => {
            expect(true).to.be.equal(false);
          });
      })
      .catch((error) => {
        expect(true).to.be.equal(false);
      });
  }).timeout(10000);

  it('should be able to delete records in the database.', (done) => {
    githubdb.upsert(`${testCollection}/MyFile`, JSON.stringify(data)).then((result) => {
      githubdb.delete(`${testCollection}/MyFile`).then((result) => {
        expect(result.status).to.be.equal(true);
        done();
      }).catch((error) => {
        expect(true).to.be.equal(false);
      });
    }).catch((error) => {
      expect(true).to.be.equal(false);
    });
  }).timeout(10000);
});

describe('As a developer, I need to be able to lock and unlock files', () => {
  before((done) => {
    githubdb.connect(config.databaseConnections[0]).then(() => {
      done();
    });
  });
  beforeEach(async function () {
    this.timeout(10000);
    Registry.unregisterAll();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const lockExists = await githubdb.isLocked('test.lock');
    if (lockExists) {
      await githubdb.unlock('test.lock');
    }
    const fileExists = await githubdb.fileExists('test.lock');
    if (fileExists) {
      await githubdb.delete('test.lock');
    }
  });
  // eslint-disable-next-line prefer-arrow-callback
  afterEach(async function () {
    this.timeout(10000);
    const lockExists = await githubdb.isLocked('test.lock');
    if (lockExists) {
      await githubdb.unlock('test.lock');
    }
    const fileExists = await githubdb.fileExists('test.lock');
    if (fileExists) {
      await githubdb.delete('test.lock');
    }
  });
  after(() => {
  });
  it('should be able to create a lock', async () => {
    try {
      await githubdb.upsert('test.lock', 'x');
      await githubdb.lock('test.lock');
      const lockExists = await githubdb.fileExists('.___lock_test.lock');
      expect(lockExists).to.be.equal(true);
    } catch (err) {
      expect(true).to.be.equal(false);
    }
  }).timeout(10000);

  it('should be able to clear a lock', async () => {
    try {
      await githubdb.upsert('test.lock', 'x');
      await githubdb.lock('test.lock');
      let lockExists = await githubdb.fileExists('.___lock_test.lock');
      expect(lockExists).to.be.equal(true);
      await githubdb.unlock('test.lock');
      lockExists = await githubdb.fileExists('.___lock_test.lock');
      expect(lockExists).to.be.equal(false);
    } catch (err) {
      expect(true).to.be.equal(false);
    }
  }).timeout(10000);
});

describe('As a developer, I need to be able to work with commits', () => {
  before((done) => {
    githubdb.connect(config.databaseConnections[0]).then(() => {
      done();
    });
  });
  beforeEach(async () => {
    Registry.unregisterAll();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    await githubdb.unlock('test.lock');
  });
  // eslint-disable-next-line prefer-arrow-callback
  afterEach(async function () {
    this.timeout(10000);
    const lockExists = await githubdb.isLocked('test.lock');
    if (lockExists) {
      await githubdb.unlock('test.lock');
    }
    const fileExists = await githubdb.fileExists('test.lock');
    if (fileExists) {
      await githubdb.delete('test.lock');
    }
  });
  after(() => {
  });

  it('should be able to list the commits for a file', async () => {
    try {
      const commits = await githubdb.listCommits('README.md');
      expect(commits.length > 0).to.be.equal(true);
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  });

  it('test tree', async () => {
    try {
      const commits = await githubdb.treeTest();
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }).timeout(5000);
});
