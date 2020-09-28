/* eslint-disable strict */
/* eslint-disable lines-around-directive */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
// @formatter:off
const chai = require('chai');
const path = require('path');
const Encrypt = require('../../../src/util/encrypt');
const Files = require('../../../src/util/files');
const Registry = require('../../../src/util/registry');
const Authentication = require('../../../private/users/authentication.json');

const { expect } = chai;
const PasswordUpdate = require('../../../src/microservices/password-update.js');
const AddAccountMicroservice = require('../../../src/microservices/add-account.js');
const DeleteAccountMicroservice = require('../../../src/microservices/delete-account.js');

describe('As a developer, I need need to update passwords.', () => {
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

  it('should update a users password', (done) => {
    const passwordUpdate = new PasswordUpdate();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    let reqInfo = {
      body: {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        rememberMe: false,
      },
    };
    const addAccountMicroservice = new AddAccountMicroservice();

    addAccountMicroservice.do(reqInfo).then((response) => {
      const fiveMinutesFromNow = new Date(Date.now() + 1000 * 60 * 5);
      const account = {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        resetPasswordToken: 'token',
        resetPasswordExpires: fiveMinutesFromNow,
      };
      reqInfo = {
        body: {
          password: 'newPassword',
          reenterPassword: 'newPassword',
          token: 'token',
        },
      };
      Registry.register([account], 'Accounts');
      passwordUpdate.do(reqInfo).then((response2) => {
        const newAuthenticationPath = path.resolve(AddAccountMicroservice.authenticationFile);
        const newAuthenticationJSON = Files.readFileSync(newAuthenticationPath);
        const newAuthentication = JSON.parse(newAuthenticationJSON);
        const encryptedPassword = Encrypt.encrypt('newPassword', crypto.iv, crypto.key);
        let found = false;
        for (let accountIndex = 0; accountIndex < newAuthentication.accounts.length; accountIndex++) {
          const user = newAuthentication.accounts[accountIndex];
          if (account.username === user.username) {
            found = true;
            expect(user.password).to.be.equal(encryptedPassword);
            break;
          }
        }
        expect(found).to.be.equal(true);
        const userAccount = Registry.getUserAccount('TestingUser');
        expect(userAccount.password).to.be.equal('newPassword');

        const deleteAccountMicroservice = new DeleteAccountMicroservice();
        deleteAccountMicroservice.do(reqInfo).then(() => { done(); });
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should not update a password for a token that does not exist.', (done) => {
    const passwordUpdate = new PasswordUpdate();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    let reqInfo = {
      body: {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        rememberMe: false,
      },
    };
    const addAccountMicroservice = new AddAccountMicroservice();

    addAccountMicroservice.do(reqInfo).then((response) => {
      const fiveMinutesFromNow = new Date(Date.now() + 1000 * 60 * 5);
      const account = {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
      };
      reqInfo = {
        body: {
          password: 'newPassword',
          reenterPassword: 'newPassword',
          token: 'token',
        },
      };
      Registry.register([account], 'Accounts');
      passwordUpdate.do(reqInfo).then((response2) => {
        expect(response2.status).to.be.equal(404);

        const deleteAccountMicroservice = new DeleteAccountMicroservice();
        deleteAccountMicroservice.do(reqInfo).then(() => { done(); });
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should not update a password with no token.', (done) => {
    const passwordUpdate = new PasswordUpdate();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    let reqInfo = {
      body: {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        rememberMe: false,
      },
    };
    const addAccountMicroservice = new AddAccountMicroservice();

    addAccountMicroservice.do(reqInfo).then((response) => {
      const fiveMinutesFromNow = new Date(Date.now() + 1000 * 60 * 5);
      const account = {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        resetPasswordToken: 'token',
        resetPasswordExpires: fiveMinutesFromNow,
      };
      reqInfo = {
        body: {
          password: 'newPassword',
          reenterPassword: 'newPassword',
        },
      };
      Registry.register([account], 'Accounts');
      passwordUpdate.do(reqInfo).then((response2) => {
        expect(response2.status).to.be.equal(403);

        const deleteAccountMicroservice = new DeleteAccountMicroservice();
        deleteAccountMicroservice.do(reqInfo).then(() => { done(); });
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should not update a password with no password.', (done) => {
    const passwordUpdate = new PasswordUpdate();
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Registry.register(crypto, 'Crypto');
    let reqInfo = {
      body: {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        rememberMe: false,
      },
    };
    const addAccountMicroservice = new AddAccountMicroservice();

    addAccountMicroservice.do(reqInfo).then((response) => {
      const fiveMinutesFromNow = new Date(Date.now() + 1000 * 60 * 5);
      const account = {
        username: 'TestingUser',
        password: 'Password',
        group1: 'users',
        email: 'test@test.com',
        firstName: 'Joe',
        lastName: 'User',
        resetPasswordToken: 'token',
        resetPasswordExpires: fiveMinutesFromNow,
      };
      reqInfo = {
        body: {
          token: 'token',
          reenterPassword: 'newPassword',
        },
      };
      Registry.register([account], 'Accounts');
      passwordUpdate.do(reqInfo).then((response2) => {
        expect(response2.status).to.be.equal(400);

        const deleteAccountMicroservice = new DeleteAccountMicroservice();
        deleteAccountMicroservice.do(reqInfo).then(() => { done(); });
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });
});
