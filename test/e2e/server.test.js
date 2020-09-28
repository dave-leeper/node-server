// @formatter:off


const chai = require('chai');

const { expect } = chai;
const request = require('request');
const Server = require('../../server.js');
const Registry = require('../../src/util/registry.js');

const config = {
  statics: [
    {
      path: '/json',
      response: './test/data/test-data.json',
      responseType: 'JSON',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/hbs',
      response: 'index.hbs',
      responseType: 'HBS',
      hbsData: { title: 'Index' },
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/text',
      response: './src/views/index.hbs',
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/json-junk',
      response: './JUNK.json',
      responseType: 'JSON',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/text-junk',
      response: './JUNK.tex',
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/json-string-array',
      response: ['./test/data/test-data.json', './test/data/test-data2.json'],
      responseType: 'JSON',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/json-object',
      response: { title: 'Index' },
      responseType: 'JSON',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/json-object-array',
      response: [{ title: 'Index' }, { title: 'Not Found' }],
      responseType: 'JSON',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/hbs-string-array',
      response: ['index.hbs', 'error.hbs'],
      responseType: 'HBS',
      hbsData: [{ title: 'Index' }, { title: 'Not Found' }],
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/text-string-array',
      response: ['./src/views/index.hbs', './src/views/error.hbs'],
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/text-object',
      response: { title: 'Index' },
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/text-object2',
      response: { text: 'Index' },
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/text-object-array',
      response: [{ title: 'Index' }, { title: 'Not Found' }],
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/text-object-array2',
      response: [{ text: 'Index' }, { text: 'Not Found' }],
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
  ],
  microservices: [
    {
      path: '/microservices',
      name: 'Services List',
      description: 'Provides a list of endpoints registered with this server.',
      serviceFile: 'microservices.js',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      path: '/statics',
      name: 'Static Services List',
      description: 'Provides a list of static services registered with this server.',
      serviceFile: 'statics.js',
    },
  ],
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
        host: 'localhost:9200',
        log: 'trace',
      },
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
  ],
};
const server = new Server();
const port = '1337';

describe('As a developer, I need a node server.', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
    Registry.unregisterAll();
  });
  
  it('should allow the server to be started, creating a proper environment, and stopped.', (done) => {
    server.init(port, config, () => {
      const databaseConnectionManager = Registry.get('DatabaseConnectorManager');
      const serverStartTime = Registry.get('ServerStartTime');
      const server2 = Registry.get('Server');
      expect(databaseConnectionManager).to.not.be.null;
      expect(databaseConnectionManager.databaseConnectors).to.not.be.null;
      expect(databaseConnectionManager.databaseConnectors.length).to.be.equal(1);
      expect(databaseConnectionManager.getConnection('elasticsearch')).to.not.be.null;
      expect(serverStartTime).to.not.be.null;
      expect(serverStartTime instanceof Date).to.be.equal(true);
      expect(server2).to.not.be.null;
      expect(server2).to.be.equal(server);
      expect(server.server).to.not.be.null;
      expect(server.express).to.not.be.null;
      server.stop(() => {
        done();
      });
    });
  });
});

describe('As a developer, I need need to run static services.', () => {
  before(() => {
  });
  beforeEach((done) => {
    Registry.unregisterAll();
    server.init(port, config, () => {
      done();
    });
  });
  afterEach((done) => {
    server.stop(() => {
      done();
    });
  });
  after(() => {
    Registry.unregisterAll();
  });

  it('should write json files as a static service', (done) => {
    const jsonResponse = '{"name":"My Server","version":"1.0"}';
    request(`http://localhost:${port}/json`, { json: true }, (err, res, body) => {
      expect(JSON.stringify(body)).to.be.equal(jsonResponse);
      done();
    });
  });

  it('should return 404 (not found) if the json file for a static service does not exist', (done) => {
    request(`http://localhost:${port}/json-junk`, { json: true }, (err, res, body) => {
      expect(res.statusCode).to.be.equal(404);
      done();
    });
  });

  it('should write text files as a static service', (done) => {
    request(`http://localhost:${port}/text`, { json: true }, (err, res, body) => {
      expect(body.indexOf('Welcome')).to.not.be.equal(-1);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });

  it('should return not found if the text file for a static service does not exist', (done) => {
    request(`http://localhost:${port}/text-junk`, { json: true }, (err, res, body) => {
      expect(res.statusCode).to.be.equal(404);
      done();
    });
  });

  it('should loop through an array of JSON files', (done) => {
    const jsonResponse = '{"name":"My Server","version":"1.0"}';
    const jsonResponse2 = '{"path":"/ping","response":{"name":"My Server","version":"1.0"},"responseType":"JSON","headers":[{"header":"MY_HEADER","value":"MY_HEADER_VALUE"}]}';
    request(`http://localhost:${port}/json-string-array`, { json: true }, (err, res, body) => {
      expect(JSON.stringify(body)).to.be.equal(jsonResponse);
      request(`http://localhost:${port}/json-string-array`, { json: true }, (err, res, body) => {
        expect(JSON.stringify(body).length).to.be.equal(147);
        request(`http://localhost:${port}/json-string-array`, { json: true }, (err, res, body) => {
          expect(JSON.stringify(body)).to.be.equal(jsonResponse);
          done();
        });
      });
    });
  });

  it('should handle JSON objects as response values for JSON', (done) => {
    const jsonResponse = { title: 'Index' };
    request(`http://localhost:${port}/json-object`, { json: true }, (err, res, body) => {
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse));
      done();
    });
  });

  it('should loop through an array of JSON object responses for JSON', (done) => {
    const jsonResponse = { title: 'Index' };
    const jsonResponse2 = { title: 'Not Found' };
    request(`http://localhost:${port}/json-object-array`, { json: true }, (err, res, body) => {
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse));
      request(`http://localhost:${port}/json-object-array`, { json: true }, (err, res, body) => {
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse2));
        request(`http://localhost:${port}/json-object-array`, { json: true }, (err, res, body) => {
          expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse));
          done();
        });
      });
    });
  });

  it('should loop through an array of text files', (done) => {
    const port = 1337;
    const server = new Server();
    const textResponse = '"<h1>{{title}}</h1>\\n<p>Welcome to {{title}}</p>\\n"';
    const textResponse2 = '"<h1>{{title}}</h1>\\n<h2>{{message}}</h2>\\n<h2>{{error.status}}</h2>\\n<pre>{{error.stack}}</pre>"';
    request(`http://localhost:${port}/text-string-array`, { json: true }, (err, res, body) => {
      let bodyJSON = JSON.stringify(body);
      expect(bodyJSON).to.be.equal(textResponse);
      request(`http://localhost:${port}/text-string-array`, { json: true }, (err, res, body) => {
        bodyJSON = JSON.stringify(body);
        expect(bodyJSON).to.be.equal(textResponse2);
        request(`http://localhost:${port}/text-string-array`, { json: true }, (err, res, body) => {
          let bodyJSON = JSON.stringify(body);
          expect(bodyJSON).to.be.equal(textResponse);
          done();
        });
      });
    });
  });

  it('should handle JSON objects as response values for text', (done) => {
    const jsonResponse = { title: 'Index' };
    request(`http://localhost:${port}/text-object`, { json: true }, (err, res, body) => {
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse));
      request(`http://localhost:${port}/text-object2`, { json: true }, (err, res, body) => {
        expect(body).to.be.equal('Index');
        done();
      });
    });
  });

  it('should loop through an array of JSON object responses for text', (done) => {
    const jsonResponse = { title: 'Index' };
    const jsonResponse2 = { title: 'Not Found' };
    request(`http://localhost:${port}/text-object-array`, { json: true }, (err, res, body) => {
      expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse));
      request(`http://localhost:${port}/text-object-array`, { json: true }, (err, res, body) => {
        expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse2));
        request(`http://localhost:${port}/text-object-array`, { json: true }, (err, res, body) => {
          expect(JSON.stringify(body)).to.be.equal(JSON.stringify(jsonResponse));
          done();
        });
      });
    });
  });

  it('should loop through an array of JSON object responses for text, sending only the text field value', (done) => {
    const jsonResponse = 'Index';
    const jsonResponse2 = 'Not Found';
    request(`http://localhost:${port}/text-object-array2`, { json: true }, (err, res, body) => {
      expect(body).to.be.equal(jsonResponse);
      request(`http://localhost:${port}/text-object-array2`, { json: true }, (err, res, body) => {
        expect(body).to.be.equal(jsonResponse2);
        request(`http://localhost:${port}/text-object-array2`, { json: true }, (err, res, body) => {
          expect(body).to.be.equal(jsonResponse);
          done();
        });
      });
    });
  });

  it('should send headers for static services that are configured for them.', (done) => {
    request(`http://localhost:${port}/json`, { json: true }, (err, res, body) => {
      expect(res).to.not.be.null;
      expect(res.headers.my_header).to.be.equal('MY_HEADER_VALUE');
      done();
    });
  });

  it('should send headers for microservicesa that are configured for them.', (done) => {
    request(`http://localhost:${port}/microservices`, { json: true }, (err, res, body) => {
      expect(res).to.not.be.null;
      expect(res.headers.my_header).to.be.equal('MY_HEADER_VALUE');
      done();
    });
  });
});
