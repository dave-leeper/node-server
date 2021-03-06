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

  it('should delete a user', (done) => {
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
      const deleteAccountMicroservice = new DeleteAccountMicroservice();
      deleteAccountMicroservice.do(reqInfo).then(() => {
        expect(Files.existsSync(`${AddAccountMicroservice.userPath}/${reqInfo.body.username}`)).to.be.equal(false);

        const userAccount = Registry.getUserAccount(reqInfo.body.username);
        expect(!!userAccount).to.be.equal(false);

        const newAuthenticationPath = path.resolve('./private/users/authentication.json');
        const newAuthenticationJSON = Files.readFileSync(newAuthenticationPath);
        const newAuthentication = JSON.parse(newAuthenticationJSON);
        let found = false;
        for (let accountIndex = 0; accountIndex < newAuthentication.accounts.length; accountIndex++) {
          const account = newAuthentication.accounts[accountIndex];
          if (account.username === reqInfo.body.username) {
            found = true;
            break;
          }
        }
        expect(found).to.be.equal(false);

        found = false;
        const machinesPath = path.resolve('./private/machines/machines.json');
        const machinesJSON = Files.readFileSync(machinesPath);
        const machines = JSON.parse(machinesJSON);
        for (let i = machines.length - 1; i >= 0; i--) {
          if (reqInfo.body.username.toUpperCase() === machines[i].username.toUpperCase()) {
            found = true;
          }
        }
        expect(found).to.be.equal(false);
        done();
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should not delete an account that does not exist.', (done) => {
    const deleteAccountMicroservice = new DeleteAccountMicroservice();
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
      deleteAccountMicroservice.do(reqInfo).then((response) => {
        expect(response.status).to.be.equal(404);
        done();
      });
    } catch (error) {
      expect(true).to.be.equal(false);
    }
  });

  it('should gracefully fail when no username is given.', (done) => {
    const deleteAccountMicroservice = new DeleteAccountMicroservice();
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
      deleteAccountMicroservice.do(reqInfo)
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
