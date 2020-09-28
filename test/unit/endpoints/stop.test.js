// @formatter:off
const chai = require('chai');

const { expect } = chai;
const Stop = require('../../../src/endpoints/stop.js');
const MockRequest = require('../../mocks/mock-request');
const MockResponse = require('../../mocks/mock-response');
const Registry = require('../../../src/util/registry');
const Log = require('../../../src/util/log');

describe('As a developer, I need need to stop the server with an API call', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
  });
  afterEach(() => {
  });
  after(() => {
  });
  it('should fail gracefully when there is no server in the registry', () => {
    const configInfo = {};
    const stop = new Stop(configInfo);
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const next = () => {};
    stop.do(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(500);
    expect(mockResponse.sendString).to.be.equal(JSON.stringify({ status: 'Error stopping server.' }));
  });
  it('should stop the server', () => {
    const configInfo = {};
    const stop = new Stop(configInfo);
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    let called = false;
    const next = () => {};
    Registry.register({ stop: () => { called = true; } }, 'Server');
    stop.do(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(200);
    expect(mockResponse.sendString).to.be.equal(JSON.stringify({ status: 'Stopping server...' }));
    expect(called).to.be.equal(true);
  });
});
