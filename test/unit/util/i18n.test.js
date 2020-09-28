// @formatter:off


const chai = require('chai');

const { expect } = chai;
const I18n = require('../../../src/util/i18n');
const strings_en_US = require('../../../src/util/strings-en-US');

describe('As a developer, I need to support i18n', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should start with the default language (en-US).', () => {
    expect(I18n.locale).to.be.equal('en-US');
    expect(I18n.strings).not.to.be.null;
    expect(Array.isArray(I18n.strings)).to.be.equal(true);
    expect(I18n.strings.length > 0).to.be.equal(true);
    expect(I18n.strings.length).to.be.equal(strings_en_US.length);
    for (let loop = 0; loop < I18n.strings.length; loop++) {
      expect(I18n.strings[loop]).to.be.equal(strings_en_US[loop]);
    }
  });

  it('should not set locale to value that has no locale file.', () => {
    I18n.setLocale('JUNK');
    expect(I18n.locale).to.be.equal('en-US');
    expect(I18n.strings).not.to.be.null;
    expect(Array.isArray(I18n.strings)).to.be.equal(true);
    expect(I18n.strings.length > 0).to.be.equal(true);
    expect(I18n.strings.length).to.be.equal(strings_en_US.length);
    for (let loop = 0; loop < I18n.strings.length; loop++) {
      expect(I18n.strings[loop]).to.be.equal(strings_en_US[loop]);
    }
  });

  it('should get strings.', () => {
    expect(I18n.get(0)).to.be.equal(I18n.strings[0]);
    expect(I18n.get(9999999)).to.be.equal(null);
    expect(I18n.get(-1)).to.be.equal(null);
    expect(I18n.get(1.5)).to.be.equal(null);
    expect(I18n.get('JUNK')).to.be.equal(null);
  });

  it('should format strings.', () => {
    expect(I18n.format()).to.be.equal(null);
    expect(I18n.format(1)).to.be.equal(null);
    expect(I18n.format(1.0)).to.be.equal(null);
    expect(I18n.format(1.01)).to.be.equal(null);
    expect(I18n.format(true)).to.be.equal(null);
    expect(I18n.format(false)).to.be.equal(null);
    expect(I18n.format(null)).to.be.equal(null);
    expect(I18n.format(1, 'a')).to.be.equal(null);
    expect(I18n.format(1.0, 'a')).to.be.equal(null);
    expect(I18n.format(1.01, 'a')).to.be.equal(null);
    expect(I18n.format(true, 'a')).to.be.equal(null);
    expect(I18n.format(false, 'a')).to.be.equal(null);
    expect(I18n.format(null, 'a')).to.be.equal(null);
    expect(I18n.format('MY STRING')).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 'a')).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 'a', 'b')).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 'a', 'b', 'c')).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING {1}', 'a')).to.be.equal('MY STRING a');
    expect(I18n.format('MY STRING {1}', 'a', 'b')).to.be.equal('MY STRING a');
    expect(I18n.format('MY STRING {1}', 'a', 'b', 'c')).to.be.equal('MY STRING a');
    expect(I18n.format('MY STRING {1} {2}', 'a')).to.be.equal('MY STRING a {2}');
    expect(I18n.format('MY STRING {1} {2}', 'a', 'b')).to.be.equal('MY STRING a b');
    expect(I18n.format('MY STRING {1} {2}', 'a', 'b', 'c')).to.be.equal('MY STRING a b');
    expect(I18n.format('MY STRING {1} {2} {3}', 'a')).to.be.equal('MY STRING a {2} {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 'a', 'b')).to.be.equal('MY STRING a b {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 'a', 'b', 'c')).to.be.equal('MY STRING a b c');
    expect(I18n.format('MY STRING {1}', 1)).to.be.equal('MY STRING 1');
    expect(I18n.format('MY STRING', 1)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 1, 2)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 1, 2, 3)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING {1}', 1)).to.be.equal('MY STRING 1');
    expect(I18n.format('MY STRING {1}', 1, 2)).to.be.equal('MY STRING 1');
    expect(I18n.format('MY STRING {1}', 1, 2, 3)).to.be.equal('MY STRING 1');
    expect(I18n.format('MY STRING {1} {2}', 1)).to.be.equal('MY STRING 1 {2}');
    expect(I18n.format('MY STRING {1} {2}', 1, 2)).to.be.equal('MY STRING 1 2');
    expect(I18n.format('MY STRING {1} {2}', 1, 2, 3)).to.be.equal('MY STRING 1 2');
    expect(I18n.format('MY STRING {1} {2} {3}', 1)).to.be.equal('MY STRING 1 {2} {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 1, 2)).to.be.equal('MY STRING 1 2 {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 1, 2, 3)).to.be.equal('MY STRING 1 2 3');
    expect(I18n.format('MY STRING', 1.0)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 1.0, 2.0)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 1.0, 2.0, 3.0)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING {1}', 1.0)).to.be.equal('MY STRING 1');
    expect(I18n.format('MY STRING {1}', 1.0, 2.0)).to.be.equal('MY STRING 1');
    expect(I18n.format('MY STRING {1}', 1.0, 2.0, 3.0)).to.be.equal('MY STRING 1');
    expect(I18n.format('MY STRING {1} {2}', 1.0)).to.be.equal('MY STRING 1 {2}');
    expect(I18n.format('MY STRING {1} {2}', 1.0, 2.0)).to.be.equal('MY STRING 1 2');
    expect(I18n.format('MY STRING {1} {2}', 1.0, 2.0, 3.0)).to.be.equal('MY STRING 1 2');
    expect(I18n.format('MY STRING {1} {2} {3}', 1.0)).to.be.equal('MY STRING 1 {2} {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 1.0, 2.0)).to.be.equal('MY STRING 1 2 {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 1.0, 2.0, 3.0)).to.be.equal('MY STRING 1 2 3');
    expect(I18n.format('MY STRING', 1.01)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 1.01, 2.01)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', 1.01, 2.01, 3.01)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING {1}', 1.01)).to.be.equal('MY STRING 1.01');
    expect(I18n.format('MY STRING {1}', 1.01, 2.01)).to.be.equal('MY STRING 1.01');
    expect(I18n.format('MY STRING {1}', 1.01, 2.01, 3.01)).to.be.equal('MY STRING 1.01');
    expect(I18n.format('MY STRING {1} {2}', 1.01)).to.be.equal('MY STRING 1.01 {2}');
    expect(I18n.format('MY STRING {1} {2}', 1.01, 2.01)).to.be.equal('MY STRING 1.01 2.01');
    expect(I18n.format('MY STRING {1} {2}', 1.01, 2.01, 3.01)).to.be.equal('MY STRING 1.01 2.01');
    expect(I18n.format('MY STRING {1} {2} {3}', 1.01)).to.be.equal('MY STRING 1.01 {2} {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 1.01, 2.01)).to.be.equal('MY STRING 1.01 2.01 {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', 1.01, 2.01, 3.01)).to.be.equal('MY STRING 1.01 2.01 3.01');
    expect(I18n.format('MY STRING', false)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', false, true)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', false, true, 3)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING {1}', false)).to.be.equal('MY STRING false');
    expect(I18n.format('MY STRING {1}', false, true)).to.be.equal('MY STRING false');
    expect(I18n.format('MY STRING {1}', false, true, false)).to.be.equal('MY STRING false');
    expect(I18n.format('MY STRING {1} {2}', false)).to.be.equal('MY STRING false {2}');
    expect(I18n.format('MY STRING {1} {2}', false, true)).to.be.equal('MY STRING false true');
    expect(I18n.format('MY STRING {1} {2}', false, true, false)).to.be.equal('MY STRING false true');
    expect(I18n.format('MY STRING {1} {2} {3}', false)).to.be.equal('MY STRING false {2} {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', false, true)).to.be.equal('MY STRING false true {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', false, true, false)).to.be.equal('MY STRING false true false');
    expect(I18n.format('MY STRING', null)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', null, null)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING', null, null, null)).to.be.equal('MY STRING');
    expect(I18n.format('MY STRING {1}', null)).to.be.equal('MY STRING null');
    expect(I18n.format('MY STRING {1}', null, null)).to.be.equal('MY STRING null');
    expect(I18n.format('MY STRING {1}', null, null, null)).to.be.equal('MY STRING null');
    expect(I18n.format('MY STRING {1} {2}', null)).to.be.equal('MY STRING null {2}');
    expect(I18n.format('MY STRING {1} {2}', null, null)).to.be.equal('MY STRING null null');
    expect(I18n.format('MY STRING {1} {2}', null, null, null)).to.be.equal('MY STRING null null');
    expect(I18n.format('MY STRING {1} {2} {3}', null)).to.be.equal('MY STRING null {2} {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', null, null)).to.be.equal('MY STRING null null {3}');
    expect(I18n.format('MY STRING {1} {2} {3}', null, null, null)).to.be.equal('MY STRING null null null');
  });
});
