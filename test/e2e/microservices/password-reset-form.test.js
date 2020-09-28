/* eslint-disable strict */
/* eslint-disable lines-around-directive */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
// @formatter:off
const chai = require('chai');
const Registry = require('../../../src/util/registry');
const Authentication = require('../../../private/users/authentication.json');

const { expect } = chai;
const PasswordResetForm = require('../../../src/microservices/password-reset-form.js');
const AddAccountMicroservice = require('../../../src/microservices/add-account.js');
const DeleteAccountMicroservice = require('../../../src/microservices/delete-account.js');

describe('As a developer, I need provide a password reset form.', () => {
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

  it('should provide a user password change form', (done) => {
    const passwordResetForm = new PasswordResetForm();
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
        params: {
          password: 'newPassword',
          reenterPassword: 'newPassword',
          token: 'token',
        },
      };
      Registry.register([account], 'Accounts');
      passwordResetForm.do(reqInfo).then((response2) => {
        expect(response2.status).to.be.equal(200);
        expect(response2.viewName).to.be.equal('password-reset-form');
        expect(response2.viewObject.title).to.be.equal('Reset Password');
        expect(response2.viewObject.verb).to.be.equal('POST');
        expect(response2.viewObject.action).to.be.equal('/user/password/reset/update');
        expect(response2.viewObject.token).to.be.equal(reqInfo.params.token);

        const deleteAccountMicroservice = new DeleteAccountMicroservice();
        deleteAccountMicroservice.do(reqInfo).then(() => { done(); });
      }, (error) => {
        expect(true).to.be.equal(false);
      });
    }, (error) => {
      expect(true).to.be.equal(false);
    });
  });

  it('should not provide a password change form when a token does not exist.', (done) => {
    const passwordResetForm = new PasswordResetForm();
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
        params: {
          password: 'newPassword',
          reenterPassword: 'newPassword',
          token: 'token',
        },
      };
      Registry.register([account], 'Accounts');
      passwordResetForm.do(reqInfo).then((response2) => {
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

  it('should not provide a password reset with no token.', (done) => {
    const passwordResetForm = new PasswordResetForm();
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
        params: {
          password: 'newPassword',
          reenterPassword: 'newPassword',
        },
      };
      Registry.register([account], 'Accounts');
      passwordResetForm.do(reqInfo).then((response2) => {
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

});
