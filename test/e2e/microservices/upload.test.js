/* eslint-disable no-console */
// @formatter:off


const fs = require('fs');
const path = require('path');
const chai = require('chai');

const { expect } = chai;
const request = require('request');
const Server = require('../../../server.js');

const config = {
  microservices: [
    {
      verb: 'POST',
      path: '/test_upload',
      name: 'Test Upload',
      description: 'Tests the file upload microservice.',
      serviceFile: 'upload.js',
    },
    {
      verb: 'POST',
      path: '/test_upload_with_name/:name',
      name: 'Test Upload',
      description: 'Tests the file upload microservice.',
      serviceFile: 'upload.js',
    },
  ],
};
const port = 1337;
const server = new Server();

describe('As a developer, I need to upload files to the server.', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach((done) => {
    server.stop(() => {
      done();
    });
  });
  after(() => {
  });

  it('should upload files', (done) => {
    console.log('====================> Upload');
    server.init(port, config, () => {
      const sourceFile = path.resolve('./public/files', 'user2.png');
      const destFile = path.resolve('./public/files', 'filename');
      const url = `http://localhost:${port}/test_upload`;
      const formData = { filename: fs.createReadStream(sourceFile) };
      request.post({ url, formData }, (err, httpResponse, body) => {
        if (err) expect(true).to.be.equal(false);
        expect(fs.existsSync(destFile)).to.be.equal(true);
        fs.unlinkSync(destFile);
        done();
      });
    });
  });

  it('should upload files using a given name', (done) => {
    server.init(port, config, () => {
      const sourceFile = path.resolve('./public/files', 'user2.png');
      const destFile = path.resolve('./public/files', 'named_file');
      const url = `http://localhost:${port}/test_upload_with_name/named_file`;
      const formData = { filename: fs.createReadStream(sourceFile) };
      request.post({ url, formData }, (err, httpResponse, body) => {
        if (err) expect(true).to.be.equal(false);
        expect(fs.existsSync(destFile)).to.be.equal(true);
        fs.unlinkSync(destFile);
        done();
      });
    });
  });

  it('should not upload files that are already on the server', (done) => {
    try {
      server.init(port, config, () => {
        const sourceFile = path.resolve('./public/files', 'user2.png');
        const destFile = path.resolve('./public/files', 'named_file');
        const url = `http://localhost:${port}/test_upload_with_name/named_file`;
        const formData = { filename: fs.createReadStream(sourceFile) };
        fs.writeFileSync(destFile, 'TEXT');
        request.post({ url, formData }, (err, httpResponse, body) => {
          if (err) expect(true).to.be.equal(false);
          expect(httpResponse.statusCode).to.be.equal(409);
          fs.unlinkSync(destFile);
          done();
        });
      });
    } catch (err) {
      console.log(JSON.stringify(err));
    }
  }).timeout(5000);
});
