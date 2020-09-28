// @formatter:off


const chai = require('chai');

const { expect } = chai;
const Strings = require('../../../src/util/strings');
const strings_en_US = require('../../../src/util/strings-en-US');

describe('As a developer, I need to work with predefined strings, possibly in multiple languages', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });
  
  it('should define all strings for all supported languages', () => {
    expect(strings_en_US.length).to.be.equal(Strings.COUNT);
  });
});
