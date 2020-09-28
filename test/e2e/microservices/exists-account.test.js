/* eslint-disable strict */
/* eslint-disable lines-around-directive */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
// @formatter:off
const chai = require('chai');
const path = require('path');
const Files = require('../../../src/util/files');
const Registry = require('../../../src/util/registry');
const Authentication = require('../../../private/users/authentication.json');

const { expect } = chai;
const AddAccountMicroservice = require('../../../src/microservices/add-account.js');
const ExistsAccountMicroservice = require('../../../src/microservices/exists-account.js');
const DeleteAccountMicroservice = require('../../../src/microservices/delete-account.js');

describe('As a developer, I need need to delete accounts.', () => {
  before(() => {
  });
  beforeEach(() => {
    Registry.unregisterAll();
    Registry.register(Authentication, 'Accounts');
  });
  afterEach(() => {
  });
  after(() => {
    Registry.unregisterAll();
  });

  it('should should know when an acount exists.', (done) => {
    const addAccountMicroservice = new AddAccountMicroservice();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const reqInfo = {
      clientIp: 'test',
      body: {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        rememberMe: true,
      },
    };
    addAccountMicroservice.do(reqInfo).then((response) => {
      const existsAccountMicroservice = new ExistsAccountMicroservice();
      existsAccountMicroservice.do(reqInfo).then((response2) => {
        expect(response2.status).to.be.equal(200);
        const deleteAccountMicroservice = new DeleteAccountMicroservice();
        deleteAccountMicroservice.do(reqInfo).then(() => { done(); });
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should know when an account does not exist.', (done) => {
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const reqInfo = {
      clientIp: 'test',
      body: {
        username: 'JUNK',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        rememberMe: false,
      },
    };
    try {
      const existsAccountMicroservice = new ExistsAccountMicroservice();
      existsAccountMicroservice.do(reqInfo).then((response2) => {
        expect(response2.status).to.be.equal(404);
      });
    } catch (error) {
      expect(true).to.be.equal(false);
    }
  });

  it('should gracefully fail when no username is given.', (done) => {
    const existsAccountMicroservice = new ExistsAccountMicroservice();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    const reqInfo = {
      clientIp: 'test',
      body: {
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        rememberMe: false,
      },
    };
    try {
      existsAccountMicroservice.do(reqInfo)
        .then((response) => {
          expect(response.status).to.be.equal(400);
          done();
        })
        .catch((error) => {
          expect(true).to.be.equal(false);
        });
    } catch (error) {
      expect(true).to.be.equal(false);
    }
  });
});
