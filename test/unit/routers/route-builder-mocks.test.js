/* eslint-disable no-underscore-dangle */
// @formatter:off

const chai = require('chai');
const passport = require('passport');
const Registry = require('../../../src/util/registry.js');
const MockRequest = require('../../mocks/mock-request.js');
const MockResponse = require('../../mocks/mock-response.js');
const MockExpressRouter = require('../../mocks/mock-express-router.js');
const RouteBuilder = require('../../../src/routers/route-builder.js');
const RouteBuilderStatics = require('../../../src/routers/route-builder-statics.js');

const { expect } = chai;

const config = {
  statics: [
    {
      path: '/json',
      response: './test/test-data.json',
      responseType: 'JSON',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      verb: 'OPTIONS',
      path: '/json',
      response: './test/test-data.json',
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
      response: './views/index.hbs',
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
      response: ['./test/test-data.json', './test/test-data2.json'],
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
    {
      verb: 'POST',
      path: '/post_path',
      response: { text: 'Not Found' },
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      verb: 'PUT',
      path: '/put_path',
      response: { text: 'Not Found' },
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      verb: 'PATCH',
      path: '/patch_path',
      response: { text: 'Not Found' },
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
    },
    {
      verb: 'DELETE',
      path: '/delete_path',
      response: { text: 'Not Found' },
      responseType: 'TEXT',
      headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
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
const expectSendString = (mockResponse) => {
  const expectedSendString = JSON.parse('{ "name": "My Server", "version": "1.0" }');
  const sendString = JSON.parse(mockResponse.sendString);
  expect(sendString.name).to.be.equal(expectedSendString.name);
  expect(sendString.version).to.be.equal(expectedSendString.version);
};
const expectSendString2 = (mockResponse) => {
  const expectedSendString = JSON.parse('{ "path": "/ping", "response": { "name": "My Server", "version": "1.0"}, "responseType": "JSON", "headers": [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]}');
  const sendString = JSON.parse(mockResponse.sendString);
  expect(sendString.name).to.be.equal(expectedSendString.name);
  expect(sendString.version).to.be.equal(expectedSendString.version);
};
const expectRender = (mockResponse, responseFile) => {
  const expectedError = {
    title: responseFile,
    message: `File Not Found: ${responseFile}.`,
    error: { status: 404 },
  };
  expect(mockResponse.renderString).to.be.equal('error');
  expect(mockResponse.renderObject.title.endsWith(responseFile)).to.be.equal(true);
  expect(mockResponse.renderObject.message.endsWith(`${responseFile}.`)).to.be.equal(true);
  expect(mockResponse.renderObject.error.status).to.be.equal(expectedError.error.status);
};
const expectHeadersAndCookies = (mockResponse) => {
  expect(mockResponse.headers).to.not.be.null;
  expect(Array.isArray(mockResponse.headers)).to.be.equal(true);
  expect(mockResponse.headers.length).to.be.equal(1);
  expect(mockResponse.headers[0]).to.not.be.null;
  expect(mockResponse.headers[0].header).to.be.equal('Access-Control-Allow-Origin');
  expect(mockResponse.headers[0].value).to.be.equal('*');
  expect(mockResponse.cookies).to.not.be.null;
  expect(Array.isArray(mockResponse.cookies)).to.be.equal(true);
  expect(mockResponse.cookies.length).to.be.equal(1);
  expect(mockResponse.cookies[0].name).to.be.equal('MY_COOKIE');
  expect(mockResponse.cookies[0].value).to.be.equal('MY_COOKIE_VALUE');
};
describe('As a developer, I need an API for creating database connections', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should not build routes using bad parameters', () => {
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockExpressRouter = new MockExpressRouter();
    let result = routeBuilderStatics.connect(null, null);
    expect(result).to.be.equal(false);
    result = routeBuilderStatics.connect({}, {});
    expect(result).to.be.equal(false);
    result = routeBuilderStatics.connect(mockExpressRouter, {});
    expect(result).to.be.equal(false);
    result = routeBuilderStatics.connect({}, config);
    expect(result).to.be.equal(false);
  });

  it('should be build routes to handlers based on config information', () => {
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderStatics.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(14);
    expect(mockExpressRouter.option.length).to.be.equal(1);
    expect(mockExpressRouter.posts.length).to.be.equal(1);
    expect(mockExpressRouter.puts.length).to.be.equal(1);
    expect(mockExpressRouter.patches.length).to.be.equal(1);
    expect(mockExpressRouter.deletes.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/json')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/hbs')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/text')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/json-junk')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/text-junk')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/json-string-array')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/json-object')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/json-object-array')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/hbs-string-array')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/text-string-array')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/text-object')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/text-object2')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/text-object-array')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.gets, '/text-object-array2')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.option, '/json')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.posts, '/post_path')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.puts, '/put_path')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.patches, '/patch_path')).to.be.equal(true);
    expect(containsPath(mockExpressRouter.deletes, '/delete_path')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/json')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/hbs')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/json-junk')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text-junk')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/json-string-array')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/json-object')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/json-object-array')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/hbs-string-array')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text-string-array')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text-object')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text-object2')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text-object-array')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text-object-array2')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.option, '/json')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.posts, '/post_path')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.puts, '/put_path')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.patches, '/patch_path')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.deletes, '/delete_path')).to.be.equal(true);
  });

  it('should build handlers that processes a path to a JSON file', () => {
    let _static = {
      path: '/json',
      response: './test/data/test-data.json',
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildJSONFileHandlerFromString(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/json',
      response: './god/knows/where.json',
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildJSONFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/json/:replace_me',
      response: './test/data/:replace_me',
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'test-data.json';
    handler = routeBuilderStatics.buildJSONFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
  });

  it('should build handlers that processes a handlebars file', () => {
    let _static = {
      path: '/hbs',
      response: 'index.hbs',
      responseType: 'HBS',
      hbsData: { title: 'Index' },
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildHandlebarsFileHandlerFromString(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expect(mockResponse.renderString.endsWith('index.hbs')).to.be.equal(true);
    expect(mockResponse.renderObject.title).to.be.equal('Index');
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/hbs',
      response: 'JUNK.hbs',
      responseType: 'HBS',
      hbsData: { title: 'Index' },
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildHandlebarsFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/hbs/:replace_me',
      response: ':replace_me',
      responseType: 'HBS',
      hbsData: { title: 'Index' },
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'index.hbs';
    handler = routeBuilderStatics.buildHandlebarsFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expect(mockResponse.renderString.endsWith('index.hbs')).to.be.equal(true);
    expect(mockResponse.renderObject.title).to.be.equal('Index');
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
  });

  it('should build handlers that processes a path to a text file', () => {
    let _static = {
      path: '/text',
      response: './test/data/test-data.json',
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildTextFileHandlerFromString(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/text',
      response: './god/knows/where.json',
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildTextFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/text/:replace_me',
      response: './test/data/:replace_me',
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'test-data.json';
    handler = routeBuilderStatics.buildTextFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
  });

  it('should build handlers that processes a path to a BLOB file', () => {
    let _static = {
      path: '/blob',
      response: './public/files/user2.png',
      responseType: 'BLOB',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildBLOBFileHandlerFromString(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendfile).to.be.equal(_static.response);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/blob',
      response: './god/knows/where.json',
      responseType: 'BLOB',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildBLOBFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/blob/:replace_me',
      response: './public/files/:replace_me',
      responseType: 'BLOB',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'user2.png';
    handler = routeBuilderStatics.buildBLOBFileHandlerFromString(_static);
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendfile).to.be.equal('./public/files/user2.png');
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
  });

  it('should be able to store and increment indexes on a _static\'s config object', () => {
    const _static = {
      path: '/blob',
      response: ['./public/files/user1.jpg', './public/files/user2.png', './public/files/user3.jpg'],
      responseType: 'BLOB',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    let index = RouteBuilderStatics.getIndex(_static);
    expect(index).to.be.equal(0);
    RouteBuilderStatics.incrementIndex(_static);
    index = RouteBuilderStatics.getIndex(_static);
    expect(index).to.be.equal(1);
    RouteBuilderStatics.incrementIndex(_static);
    index = RouteBuilderStatics.getIndex(_static);
    expect(index).to.be.equal(2);
    RouteBuilderStatics.incrementIndex(_static); // loop
    index = RouteBuilderStatics.getIndex(_static);
    expect(index).to.be.equal(0);
  });

  it('should build handlers that processes an array of paths to JSON files', () => {
    let _static = {
      path: '/json',
      response: ['./test/data/test-data.json', './test/data/test-data2.json'],
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildJSONFileHandlerFromArrayOfStrings(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
    handler(mockRequest, mockResponse);
    expectSendString2(mockResponse);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/json',
      response: ['./god/knows/where.json', './test/data/test-data2.json'],
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildJSONFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response[0]);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/json/:replace_me',
      response: ['./test/data/:replace_me', './test/data/:replace_me'],
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'test-data.json';
    handler = routeBuilderStatics.buildJSONFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
  });

  it('should build handlers that processes an array of paths to Handlebars files', () => {
    let _static = {
      path: '/hbs',
      response: ['./src/views/index.hbs', './src/views/message.hbs'],
      responseType: 'HBS',
      hbsData: [{ title: 'Index' }, { title: 'Message', message: 'Message', status: 200 }],
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildHandlebarsFileHandlerFromArrayOfStrings(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expect(mockResponse.renderString).to.be.equal('./src/views/index.hbs');
    expect(mockResponse.renderObject.title).to.be.equal('Index');
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
    handler(mockRequest, mockResponse);
    expect(mockResponse.renderString).to.be.equal('./src/views/message.hbs');
    expect(mockResponse.renderObject.title).to.be.equal('Message');
    expect(mockResponse.renderObject.message).to.be.equal('Message');
    expect(mockResponse.renderObject.status).to.be.equal(200);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/hbs',
      response: ['JUNK.hbs', './src/views/message.hbs'],
      responseType: 'HBS',
      hbsData: { title: 'Index' },
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildHandlebarsFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response[0]);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/hbs/:replace_me',
      response: ['./src/views/:replace_me', './src/views/:replace_me'],
      responseType: 'HBS',
      hbsData: [{ title: 'Index' }, { title: 'Message', message: 'Message', status: 200 }],
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'index.hbs';
    handler = routeBuilderStatics.buildHandlebarsFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expect(mockResponse.renderString).to.be.equal('./src/views/index.hbs');
    expect(mockResponse.renderObject.title).to.be.equal('Index');
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
  });

  it('should build handlers that processes an array of paths to text files', () => {
    let _static = {
      path: '/text',
      response: ['./test/data/test-data.json', './test/data/test-data2.json'],
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildTextFileHandlerFromArrayOfStrings(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
    handler(mockRequest, mockResponse);
    expectSendString2(mockResponse);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/text',
      response: ['./god/knows/where.json', './test/data/test-data2.json'],
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildTextFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response[0]);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/text/:replace_me',
      response: ['./test/data/:replace_me', './test/data/:replace_me'],
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'test-data.json';
    handler = routeBuilderStatics.buildTextFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
  });

  it('should build handlers that processes an array of paths to BLOB files', () => {
    let _static = {
      path: '/blob',
      response: ['./public/files/user2.png', './public/files/user3.jpg'],
      responseType: 'BLOB',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildBLOBFileHandlerFromArrayOfStrings(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendfile).to.be.equal(_static.response[0]);
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendfile).to.be.equal(_static.response[1]);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/blob',
      response: ['./god/knows/where.json', './public/files/user3.jpg'],
      responseType: 'BLOB',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildBLOBFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expectRender(mockResponse, _static.response[0]);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/blob/:replace_me',
      response: ['./public/files/:replace_me', './public/files/:replace_me'],
      responseType: 'BLOB',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    mockRequest.params.replace_me = 'user2.png';
    handler = routeBuilderStatics.buildBLOBFileHandlerFromArrayOfStrings(_static);
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendfile).to.be.equal('./public/files/user2.png');
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
  });

  it('should build handlers that processes a JSON object', () => {
    let _static = {
      path: '/json',
      response: { name: 'My Server', version: '1.0' },
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildJSONHandlerFromObject(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/json',
      response: 'JUNK',
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildJSONHandlerFromObject(_static);
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendString).to.be.equal('"JUNK"');
    expectHeadersAndCookies(mockResponse);
  });

  it('should build handlers that processes a JSON object for text', () => {
    let _static = {
      path: '/text',
      response: { text: 'Text' },
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let handler = routeBuilderStatics.buildTextHandlerFromObject(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendString).to.be.equal('Text');
    expectHeadersAndCookies(mockResponse);
    _static = {
      path: '/json',
      response: { message: 'Text' },
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    mockRequest.reset();
    mockResponse.reset();
    handler = routeBuilderStatics.buildTextHandlerFromObject(_static);
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendString).to.be.equal(JSON.stringify(_static.response));
    expectHeadersAndCookies(mockResponse);
  });

  it('should build handlers that processes an array of JSON objects', () => {
    const _static = {
      path: '/json',
      response: [{ name: 'My Server', version: '1.0' }, {
        path: '/ping', response: { name: 'My Server', version: '1.0' }, responseType: 'JSON', headers: [{ header: 'MY_HEADER', value: 'MY_HEADER_VALUE' }],
      }],
      responseType: 'JSON',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const handler = routeBuilderStatics.buildJSONHandlerFromArrayOfObjects(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expectSendString(mockResponse);
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
    handler(mockRequest, mockResponse);
    expectSendString2(mockResponse);
    expectHeadersAndCookies(mockResponse);
  });

  it('should build handlers that processes an array of JSON objects for text', () => {
    const _static = {
      path: '/text',
      response: [{ text: 'Text' }, { message: 'Text' }],
      responseType: 'TEXT',
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const handler = routeBuilderStatics.buildTextHandlerFromArrayOfObjects(_static);
    expect(handler).to.not.be.null;
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendString).to.be.equal('Text');
    expectHeadersAndCookies(mockResponse);
    mockRequest.reset();
    mockResponse.reset();
    handler(mockRequest, mockResponse);
    expect(mockResponse.sendString).to.be.equal(JSON.stringify(_static.response[1]));
    expectHeadersAndCookies(mockResponse);
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
      statics: [
        {
          path: '/text',
          response: [{ text: 'Text' }, { message: 'Text' }],
          responseType: 'TEXT',
          headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
          cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
          authentication: 'local',
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderStatics = new RouteBuilderStatics();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderStatics.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/text')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text')).to.be.equal(true);
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
      statics: [
        {
          path: '/text',
          response: [{ text: 'Text' }, { message: 'Text' }],
          responseType: 'TEXT',
          headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
          cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
          authorization: { strategy: 'local', groups: ['admin'] },
        },
      ],
    };
    Registry.register(passport, 'Passport');
    RouteBuilder.buildAuthenticationStrategies(config);

    const routeBuilderStatics = new RouteBuilderStatics();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderStatics.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/text')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text')).to.be.equal(true);
    expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.gets[0].handler.length).to.be.equal(3);
  });

  it('should support log levels', () => {
    const config = {
      statics: [
        {
          path: '/text',
          response: [{ text: 'Text' }, { message: 'Text' }],
          responseType: 'TEXT',
          headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
          cookies: [{ name: 'MY_COOKIE', value: 'MY_COOKIE_VALUE' }],
          logging: 'ALL',
        },
      ],
    };
    const routeBuilderStatics = new RouteBuilderStatics();
    const mockExpressRouter = new MockExpressRouter();
    const result = routeBuilderStatics.connect(mockExpressRouter, config);
    expect(result).to.be.equal(true);
    expect(mockExpressRouter.gets.length).to.be.equal(1);
    expect(containsPath(mockExpressRouter.gets, '/text')).to.be.equal(true);
    expect(hasHandler(mockExpressRouter.gets, '/text')).to.be.equal(true);
    expect(Array.isArray(mockExpressRouter.gets[0].handler)).to.be.equal(true);
    expect(mockExpressRouter.gets[0].handler.length).to.be.equal(4);
  });
});
