// @formatter:off


const chai = require('chai');

const { expect } = chai;
const I18n = require('../../../src/util/i18n');
const Error = require('../../../src/util/error');
const Errors = require('../../../src/util/errors');
const Strings = require('../../../src/util/strings');

describe('As a developer, I need to generate errors', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should get errors.', () => {
    const error = Error.get(Errors.FILE_ALREADY_EXISTS);
    const title = I18n.get(Strings.ERROR_MESSAGE_FILE_NAME);
    const message = I18n.get(Strings.ERROR_MESSAGE_FILE_ALREADY_EXISTS);
    expect(error.title).to.be.equal(title);
    expect(error.message).to.be.equal(message);
  });

  it('should format error strings.', () => {
    const fileName = 'file name';
    const error = Error.get(Errors.FILE_ALREADY_EXISTS, fileName, fileName, { stack: 'STACK' });
    const title = I18n.format(I18n.get(Strings.ERROR_MESSAGE_FILE_NAME), fileName);
    const message = I18n.format(I18n.get(Strings.ERROR_MESSAGE_FILE_ALREADY_EXISTS), fileName);
    expect(error.title).to.be.equal(title);
    expect(error.message).to.be.equal(message);
    expect(error.error.stack).to.be.equal('STACK');
  });
});
