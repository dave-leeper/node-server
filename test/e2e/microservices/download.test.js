// @formatter:off


const fs = require('fs');
const path = require('path');
const chai = require('chai');

const { expect } = chai;
const request = require('request');
const Download = require('../../../src/microservices/download');

describe('As a developer, I need to download files from the server.', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });
  it('should download files from the server', (done) => {
    const download = new Download();
    const sourceFile = path.resolve('./public/files', 'filename');
    fs.writeFileSync(sourceFile, 'TEXT');
    download.do({ params: { name: 'filename' } }).then((result) => {
      expect(result.status).to.be.equal(200);
      expect(result.fileDownloadPath).to.be.equal(sourceFile);
      fs.unlinkSync(sourceFile);
      done();
    });
  });

  it('should fail gracefully when a file does not exist on the server', (done) => {
    const download = new Download();
    download.do({ params: { name: 'JUNK' } }).then((result) => {
    }, (error) => {
      expect(error.status).to.be.equal(404);
      expect(error.viewName).to.be.equal('error');
      done();
    });
  });
});
