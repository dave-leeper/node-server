// @formatter:off


const chai = require('chai');

const { expect } = chai;

const LocalStrategy = require('../../../src/authentication/local-strategy.js');
const MockRequest = require('../../mocks/mock-request');
const MockResponse = require('../../mocks/mock-response');
const Registry = require('../../../src/util/registry');
const Strings = require('../../../src/util/strings');
const I18n = require('../../../src/util/i18n');
const Log = require('../../../src/util/log');

describe('As a developer, I need need to define a custom authentication/authorization strategy', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should fail gracefully when there is no server config in the registry', () => {
    const operation = 'getAuthorization';
    const err = Log.stringify({
      operation, statusType: 'error', status: 501, message: I18n.get(Strings.ERROR_MESSAGE_AUTHORIZATION_NOT_CONFIGURED),
    });
    const localStrategy = new LocalStrategy();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let called = false;
    const next = () => { called = true; };
    const handler = localStrategy.getAuthorization();
    mockRequest.url = '/path';
    handler(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(501);
    expect(mockResponse.sendString).to.be.equal(err);
    expect(called).to.be.equal(false);
  });

  it('should fail gracefully when there is no request or no request path', () => {
    Registry.register({ stuff: 'stuff' }, 'ServerConfig');
    const operation = 'getAuthorization';
    const err = Log.stringify({
      operation, statusType: 'error', status: 501, message: I18n.get(Strings.ERROR_MESSAGE_AUTHORIZATION_NOT_CONFIGURED),
    });
    const localStrategy = new LocalStrategy();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let called = false;
    const next = () => { called = true; };
    const handler = localStrategy.getAuthorization();
    handler(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(501);
    expect(mockResponse.sendString).to.be.equal(err);
    expect(called).to.be.equal(false);
    handler(null, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(501);
    expect(mockResponse.sendString).to.be.equal(err);
    expect(called).to.be.equal(false);
  });

  it('should fail gracefully when there is no request username', () => {
    Registry.register({ stuff: 'stuff' }, 'ServerConfig');
    Registry.register(['stuff'], 'Accounts');
    const operation = 'getAuthorization';
    const err = Log.stringify({
      operation, statusType: 'error', status: 401, message: I18n.get(Strings.ERROR_MESSAGE_LOGIN_REQUIRED),
    });
    const localStrategy = new LocalStrategy();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let called = false;
    const next = () => { called = true; };
    const handler = localStrategy.getAuthorization();
    mockRequest.url = '/path';
    handler(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(401);
    expect(mockResponse.sendString).to.be.equal(err);
    expect(called).to.be.equal(false);
    mockRequest.user = {};
    handler(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(401);
    expect(mockResponse.sendString).to.be.equal(err);
    expect(called).to.be.equal(false);
  });

  it('should fail gracefully when the request username has no account', () => {
    Registry.register({ stuff: 'stuff' }, 'ServerConfig');
    Registry.register(['stuff'], 'Accounts');
    const operation = 'getAuthorization';
    const err = Log.stringify({
      operation, statusType: 'error', status: 401, message: I18n.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_USER_NAME), 'JUNK'),
    });
    const localStrategy = new LocalStrategy();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let called = false;
    const next = () => { called = true; };
    const handler = localStrategy.getAuthorization();
    mockRequest.url = '/path';
    mockRequest.user = { username: 'JUNK' };
    handler(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(401);
    expect(mockResponse.sendString).to.be.equal(err);
    expect(called).to.be.equal(false);
  });

  it('should succeed when there is config authorization info for a path', () => {
    const now = new Date();
    Registry.register({ stuff: 'stuff' }, 'ServerConfig');
    Registry.register([{
      username: 'admin',
      password: 'admin',
      groups: ['admin'],
      token: 'x',
      lastAccessTime: now,
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
    }], 'Accounts');
    const localStrategy = new LocalStrategy();
    const mockRequest = new MockRequest();
    mockRequest.url = '/path';
    mockRequest.user = { username: 'admin' };
    mockRequest.header('Request Method', 'GET');
    mockRequest.header('Authorization', 'NODE-SERVER token="x"');
    const mockResponse = new MockResponse();
    let called = false;
    const next = () => { called = true; };
    const handler = localStrategy.getAuthorization();
    handler(mockRequest, mockResponse, next);
    expect(called).to.be.equal(true);
  });

  it('should fail gracefully when the request username has no permissions', () => {
    const now = new Date();
    const config = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
      microservices: [
        {
          path: '/path',
          name: 'A microservice',
          description: 'A microservice used for testing',
          serviceFile: 'mocks.js',
          authorization: { strategy: 'local', groups: ['admin'] },
        },
      ],
    };
    Registry.register(config, 'ServerConfig');
    Registry.register([{
      username: 'username',
      password: 'password',
      groups: ['user'],
      token: 'x',
      lastAccessTime: now,
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
      cookies: [
        { name: 'MY_COOKIE1', value: 'MY_COOKIE_VALUE1' },
        { name: 'MY_COOKIE2', value: 'MY_COOKIE_VALUE2', expires: 9999 },
        { name: 'MY_COOKIE3', value: 'MY_COOKIE_VALUE3', maxAge: 9999 },
      ],
    }], 'Accounts');
    const operation = 'getAuthorization';
    const err = Log.stringify({
      operation, statusType: 'error', status: 403, message: I18n.get(Strings.ERROR_MESSAGE_UNAUTHORIZED),
    });
    const localStrategy = new LocalStrategy();
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let called = false;
    const next = () => { called = true; };
    const handler = localStrategy.getAuthorization();
    mockRequest.url = '/path';
    mockRequest.user = { username: 'username' };
    mockRequest.header('Request Method', 'GET');
    mockRequest.header('Authorization', 'NODE-SERVER token="x"');
    handler(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(403);
    expect(mockResponse.sendString).to.be.equal(err);
    expect(called).to.be.equal(false);
  });

  it('should succeed when the request username has permissions', () => {
    const now = new Date();
    const config = {
      authentication: [
        {
          name: 'local',
          strategyFile: 'local-strategy.js',
          config: { successRedirect: '/ping', failureRedirect: '/login' },
        },
      ],
      microservices: [
        {
          path: '/path',
          name: 'A microservice',
          description: 'A microservice used for testing',
          serviceFile: 'statics.js',
          authorization: { strategy: 'local', groups: ['admin'] },
        },
      ],
    };
    Registry.register(config, 'ServerConfig');
    Registry.register([{
      lastAccessTime: new Date(),
      username: 'admin',
      password: 'admin',
      groups: ['admin'],
      token: 'x',
      lastAccessTime: now,
      headers: [{ header: 'Access-Control-Allow-Origin', value: '*' }],
    }], 'Accounts');
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    mockRequest.url = '/path';
    mockRequest.user = { username: 'admin' };
    mockRequest.header('Request Method', 'GET');
    mockRequest.header('Authorization', 'NODE-SERVER token="x"');
    const localStrategy = new LocalStrategy();
    let called = false;
    const next = () => { called = true; };
    const handler = localStrategy.getAuthorization();
    handler(mockRequest, mockResponse, next);
    expect(called).to.be.equal(true);
  });
});
