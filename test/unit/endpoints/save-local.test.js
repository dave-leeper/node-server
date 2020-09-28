// @formatter:off
const chai = require('chai');

const { expect } = chai;
const SaveLocal = require('../../../src/endpoints/save-local.js');
const MockRequest = require('../../mocks/mock-request');
const MockResponse = require('../../mocks/mock-response');

describe('As a developer, I need need to stop the server with an API call', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });
  it('should download provided data as a file', () => {
    const configInfo = {};
    const saveLocal = new SaveLocal(configInfo);
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    mockRequest.body = "foo"
    const next = () => {};
    saveLocal.do(mockRequest, mockResponse, next);
    expect(mockResponse.sendStatus).to.be.equal(200);
    expect(mockResponse.sendfile.startsWith("/Users/davidleeper/Documents/src/node/mock-server/public/files_TMP.")).to.be.equal(true);
  });
});
