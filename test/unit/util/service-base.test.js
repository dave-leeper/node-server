// @formatter:off


const chai = require('chai');

const { expect } = chai;
const passport = require('passport');
const ServiceBase = require('../../../src/util/service-base');
const RouteBuilder = require('../../../src/routers/route-builder');
const Registry = require('../../../src/util/registry');
const MockRequest = require('../../mocks/mock-request.js');
const MockResponse = require('../../mocks/mock-response.js');

describe('As a developer, I need to perform common operations on requests and responses', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should gracefully handle no req or res when asked to send 404 errors', () => {
    const serviceBase = new ServiceBase();
    serviceBase.notFoundResponse(null, null);
    expect(true).to.be.equal(true);
    const mockResponse = new MockResponse();
    const error = {
      title: 'Not Found',
      message: 'File Not Found.',
      error: { status: 404 },
      requestURL: undefined,
    };
    serviceBase.notFoundResponse(null, mockResponse);
    expect(mockResponse.renderString).to.be.equal('error');
    expect(JSON.stringify(mockResponse.renderObject)).to.be.equal(JSON.stringify(error));
    const mockRequest = new MockRequest();
    serviceBase.notFoundResponse(mockRequest, mockResponse);
    expect(mockResponse.renderString).to.be.equal('error');
    expect(JSON.stringify(mockResponse.renderObject)).to.be.equal(JSON.stringify(error));
  });

  it('should send 404 errors', () => {
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const originalURL = '/path';
    const error = {
      title: 'Not Found',
      message: 'File Not Found.',
      error: { status: 404 },
      requestURL: originalURL,
    };
    mockRequest.originalUrl = originalURL;
    serviceBase.notFoundResponse(mockRequest, mockResponse);
    expect(mockResponse.renderString).to.be.equal('error');
    expect(JSON.stringify(mockResponse.renderObject)).to.be.equal(JSON.stringify(error));
  });

  it('should gracefully handle no headers when asked to add headers', () => {
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    serviceBase.addHeaders(null, mockRequest, mockResponse);
    expect(mockResponse.headers.length).to.be.equal(0);
  });

  it('should add headers from config info', () => {
    const configInfo = {
      path: '/elasticsearch/index/mapping/upload',
      response: 'upload.hbs',
      responseType: 'HBS',
      hbsData: { title: 'Upload ElasticSearch Mapping', action: '/elasticsearch/index/mapping', verb: 'POST' },
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
    };
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    serviceBase.addHeaders(configInfo, mockRequest, mockResponse);
    expect(mockResponse.headers.length).to.be.equal(1);
    expect(mockResponse.headers[0].header).to.be.equal('Access-Control-Allow-Origin');
    expect(mockResponse.headers[0].value).to.be.equal('*');
  });

  it('should add user headers from user Registry info', () => {
    const registryInfo = {
      users: {
        test_user: [
          { header: 'Access-Control-Allow-Origin', value: '*' },
          { header: 'Authorization', value: '?' },
        ],
      },
    };
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    Registry.register(registryInfo, 'Headers');
    mockRequest.user = { username: 'test_user' };
    serviceBase.addHeaders(null, mockRequest, mockResponse);
    expect(mockResponse.headers.length).to.be.equal(2);
    expect(mockResponse.headers[0].header).to.be.equal('Access-Control-Allow-Origin');
    expect(mockResponse.headers[0].value).to.be.equal('*');
    expect(mockResponse.headers[1].header).to.be.equal('Authorization');
    expect(mockResponse.headers[1].value).to.be.equal('?');
  });

  it('should add user headers from config info and user Registry info', () => {
    const configInfo = {
      path: '/elasticsearch/index/mapping/upload',
      response: 'upload.hbs',
      responseType: 'HBS',
      hbsData: { title: 'Upload ElasticSearch Mapping', action: '/elasticsearch/index/mapping', verb: 'POST' },
      headers: [{ header: 'Content-Length', value: '345' }],
    };
    const registryInfo = {
      users: {
        test_user: [
          { header: 'Access-Control-Allow-Origin', value: '*' },
          { header: 'Authorization', value: '?' },
        ],
      },
    };
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    Registry.register(registryInfo, 'Headers');
    mockRequest.user = { username: 'test_user' };
    serviceBase.addHeaders(configInfo, mockRequest, mockResponse);
    expect(mockResponse.headers.length).to.be.equal(3);
    expect(mockResponse.headers[0].header).to.be.equal('Content-Length');
    expect(mockResponse.headers[0].value).to.be.equal('345');
    expect(mockResponse.headers[1].header).to.be.equal('Access-Control-Allow-Origin');
    expect(mockResponse.headers[1].value).to.be.equal('*');
    expect(mockResponse.headers[2].header).to.be.equal('Authorization');
    expect(mockResponse.headers[2].value).to.be.equal('?');
  });

  it('should gracefully handle no cookies when asked to add cookies', () => {
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    serviceBase.addCookies(null, mockRequest, mockResponse);
    expect(mockResponse.cookies.length).to.be.equal(0);
  });

  it('should add cookies from config info', () => {
    const configInfo = {
      path: '/elasticsearch/index/mapping/upload',
      response: 'upload.hbs',
      responseType: 'HBS',
      hbsData: { title: 'Upload ElasticSearch Mapping', action: '/elasticsearch/index/mapping', verb: 'POST' },
      cookies: [
        { name: 'MY_COOKIE1', value: 'MY_COOKIE_VALUE1' },
        { name: 'MY_COOKIE2', value: 'MY_COOKIE_VALUE2', expires: 9999 },
        { name: 'MY_COOKIE3', value: 'MY_COOKIE_VALUE3', maxAge: 9999 },
      ],
    };
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    serviceBase.addCookies(configInfo, mockRequest, mockResponse);
    expect(mockResponse.cookies.length).to.be.equal(3);
    expect(mockResponse.cookies[0].name).to.be.equal('MY_COOKIE1');
    expect(mockResponse.cookies[0].value).to.be.equal('MY_COOKIE_VALUE1');
    expect(mockResponse.cookies[1].name).to.be.equal('MY_COOKIE2');
    expect(mockResponse.cookies[1].value).to.be.equal('MY_COOKIE_VALUE2');
    expect(mockResponse.cookies[1].age.expires).not.to.be.null;
    expect(mockResponse.cookies[2].name).to.be.equal('MY_COOKIE3');
    expect(mockResponse.cookies[2].value).to.be.equal('MY_COOKIE_VALUE3');
    expect(mockResponse.cookies[2].age.maxAge).to.be.equal(9999);
  });

  it('should add user cookies from user Registry info', () => {
    const registryInfo = {
      users: {
        test_user: [
          { name: 'MY_COOKIE1', value: 'MY_COOKIE_VALUE1' },
          { name: 'MY_COOKIE2', value: 'MY_COOKIE_VALUE2', expires: 9999 },
          { name: 'MY_COOKIE3', value: 'MY_COOKIE_VALUE3', maxAge: 9999 },
        ],
      },
    };
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    Registry.register(registryInfo, 'Cookies');
    mockRequest.user = { username: 'test_user' };
    serviceBase.addCookies(null, mockRequest, mockResponse);
    expect(mockResponse.cookies.length).to.be.equal(3);
    expect(mockResponse.cookies[0].name).to.be.equal('MY_COOKIE1');
    expect(mockResponse.cookies[0].value).to.be.equal('MY_COOKIE_VALUE1');
    expect(mockResponse.cookies[1].name).to.be.equal('MY_COOKIE2');
    expect(mockResponse.cookies[1].value).to.be.equal('MY_COOKIE_VALUE2');
    expect(mockResponse.cookies[1].age.expires).not.to.be.null;
    expect(mockResponse.cookies[2].name).to.be.equal('MY_COOKIE3');
    expect(mockResponse.cookies[2].value).to.be.equal('MY_COOKIE_VALUE3');
    expect(mockResponse.cookies[2].age.maxAge).to.be.equal(9999);
  });

  it('should add user cookies from config info and user Registry info', () => {
    const configInfo = {
      path: '/elasticsearch/index/mapping/upload',
      response: 'upload.hbs',
      responseType: 'HBS',
      hbsData: { title: 'Upload ElasticSearch Mapping', action: '/elasticsearch/index/mapping', verb: 'POST' },
      cookies: [
        { name: 'MY_COOKIE1', value: 'MY_COOKIE_VALUE1' },
        { name: 'MY_COOKIE2', value: 'MY_COOKIE_VALUE2', expires: 9999 },
        { name: 'MY_COOKIE3', value: 'MY_COOKIE_VALUE3', maxAge: 9999 },
      ],
    };
    const registryInfo = {
      users: {
        test_user: [
          { name: 'MY_COOKIE4', value: 'MY_COOKIE_VALUE4' },
          { name: 'MY_COOKIE5', value: 'MY_COOKIE_VALUE5', expires: 9999 },
          { name: 'MY_COOKIE6', value: 'MY_COOKIE_VALUE6', maxAge: 9999 },
        ],
      },
    };
    const serviceBase = new ServiceBase();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    Registry.register(registryInfo, 'Cookies');
    mockRequest.user = { username: 'test_user' };
    serviceBase.addCookies(configInfo, mockRequest, mockResponse);
    expect(mockResponse.cookies.length).to.be.equal(6);
    expect(mockResponse.cookies[0].name).to.be.equal('MY_COOKIE1');
    expect(mockResponse.cookies[0].value).to.be.equal('MY_COOKIE_VALUE1');
    expect(mockResponse.cookies[1].name).to.be.equal('MY_COOKIE2');
    expect(mockResponse.cookies[1].value).to.be.equal('MY_COOKIE_VALUE2');
    expect(mockResponse.cookies[1].age.expires).not.to.be.null;
    expect(mockResponse.cookies[2].name).to.be.equal('MY_COOKIE3');
    expect(mockResponse.cookies[2].value).to.be.equal('MY_COOKIE_VALUE3');
    expect(mockResponse.cookies[2].age.maxAge).to.be.equal(9999);
    expect(mockResponse.cookies[3].name).to.be.equal('MY_COOKIE4');
    expect(mockResponse.cookies[3].value).to.be.equal('MY_COOKIE_VALUE4');
    expect(mockResponse.cookies[4].name).to.be.equal('MY_COOKIE5');
    expect(mockResponse.cookies[4].value).to.be.equal('MY_COOKIE_VALUE5');
    expect(mockResponse.cookies[4].age.expires).not.to.be.null;
    expect(mockResponse.cookies[5].name).to.be.equal('MY_COOKIE6');
    expect(mockResponse.cookies[5].value).to.be.equal('MY_COOKIE_VALUE6');
    expect(mockResponse.cookies[5].age.maxAge).to.be.equal(9999);
  });

  it('should gracefully handle bad parameters when sending an error', () => {
    const serviceBase = new ServiceBase();
    serviceBase.sendErrorResponse(null, null, null);
    expect(true).to.be.equal(true);
    const mockResponse = new MockResponse();
    serviceBase.sendErrorResponse(null, mockResponse, null);
    expect(mockResponse.sendStatus).to.be.equal(500);
    expect(mockResponse.renderString).to.be.equal('error');
    expect(mockResponse.renderObject).to.be.null;
    serviceBase.sendErrorResponse(null, mockResponse, 401);
    expect(mockResponse.sendStatus).to.be.equal(401);
    expect(mockResponse.renderString).to.be.equal('error');
    expect(mockResponse.renderObject).to.be.null;
    const errObj = { stuff: 'stuff' };
    serviceBase.sendErrorResponse(errObj, mockResponse, null);
    expect(mockResponse.sendStatus).to.be.equal(500);
    expect(mockResponse.renderString).to.be.equal('error');
    expect(mockResponse.renderObject).to.be.equal(errObj);
  });

  it('should send an error', () => {
    const serviceBase = new ServiceBase();
    const mockResponse = new MockResponse();
    const errObj = { stuff: 'stuff' };
    serviceBase.sendErrorResponse(errObj, mockResponse, 401);
    expect(mockResponse.sendStatus).to.be.equal(401);
    expect(mockResponse.renderString).to.be.equal('error');
    expect(mockResponse.renderObject).to.be.equal(errObj);
  });

  it('should gracefully handle bad parameters when getting an authentication strategy handler', () => {
    const serviceBase = new ServiceBase();
    let handler = serviceBase.authentication(null, null);
    expect(handler).to.be.equal(null);
    handler = serviceBase.authentication('stuff', null);
    expect(handler).to.be.equal(null);
    handler = serviceBase.authentication(null, 'stuff');
    expect(handler).to.be.equal(null);
    const authentication = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
    };
    Registry.register(passport, 'Passport');
    const result = RouteBuilder.buildAuthenticationStrategies(authentication);
    expect(result).to.be.equal(true);
    Registry.unregisterAll(); // <--------------
    handler = serviceBase.authentication(authentication.authenticationStrategies, 'local');
    expect(handler).to.be.equal(null);
  });

  it('should build an authentication strategy handler', () => {
    const serviceBase = new ServiceBase();
    const authentication = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
    };
    Registry.register(passport, 'Passport');
    const result = RouteBuilder.buildAuthenticationStrategies(authentication);
    expect(result).to.be.equal(true);
    const handler = serviceBase.authentication(authentication.authenticationStrategies, 'local');
    expect(handler).not.to.be.null;
  });

  it('should gracefully handle bad parameters when getting an authorization strategy handler', () => {
    const serviceBase = new ServiceBase();
    let handler = serviceBase.authorization(null, null);
    expect(handler).to.be.equal(null);
    handler = serviceBase.authorization({}, null);
    expect(handler).to.be.equal(null);
    handler = serviceBase.authorization(null, 'yada');
    expect(handler).to.be.equal(null);
    handler = serviceBase.authorization(null, { strategy: 'yada' });
    expect(handler).to.be.equal(null);
    handler = serviceBase.authorization({}, { strategy: 'yada' });
    expect(handler).to.be.equal(null);
    handler = serviceBase.authorization({ yada: 'yada' }, { strategy: 'yada' });
    expect(handler).to.be.equal(null);
    handler = serviceBase.authorization({ yada: { strategy: 'yada' } }, { strategy: 'yada' });
    expect(handler).to.be.equal(null);
  });

  it('should build an authorization strategy handler', () => {
    const serviceBase = new ServiceBase();
    const handler = serviceBase.authorization({ yada: { strategy: { getAuthorization: () => 'super yada' } } }, { strategy: 'yada' });
    expect(handler).to.be.equal('super yada');
  });
});
