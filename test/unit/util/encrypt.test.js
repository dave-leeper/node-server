// @formatter:off


const chai = require('chai');

const { expect } = chai;
const Encrypt = require('../../../src/util/encrypt');

describe('As a developer, I need to encrypt data', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should encrypt data.', () => {
    const crypto = {
      key: Buffer.from([0xfa, 0x22, 0xea, 0xfd, 0x8a, 0xac, 0xe8, 0x71, 0x9d, 0xa8, 0x82, 0x65, 0x75, 0x12, 0x16, 0x49, 0xaf, 0xfe, 0x39, 0x9f, 0x1d, 0x16, 0xa1, 0xe8, 0x5a, 0x8e, 0xd6, 0x27, 0xf6, 0xde, 0x24, 0x58]),
      iv: Buffer.from([0xfb, 0x2e, 0x85, 0x78, 0x55, 0x1d, 0x91, 0xe8, 0x4d, 0xfd, 0x25, 0xe1, 0xb9, 0x81, 0x2d, 0xd5]),
    };
    Encrypt.key = crypto.key;
    Encrypt.iv = crypto.iv;
    const encrypted = Encrypt.encrypt('Test Data', crypto.iv, crypto.key);
    expect(encrypted).not.to.be.equal('Test Data');
    const decrypted = Encrypt.decrypt(encrypted, crypto.iv, crypto.key);
    expect(decrypted).to.be.equal('Test Data');
  });
});
