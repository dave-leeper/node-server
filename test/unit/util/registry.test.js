// @formatter:off


const chai = require('chai');

const { expect } = chai;
const Registry = require('../../../src/util/registry');

describe('As a developer, I need to add named objects into a registry available to the entire process.', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
    Registry.unregisterAll();
  });
  after(() => {
  });

  it('should be able to register and unregister listeners.', () => {
    const a = { value: 'A' };
    const b = { value: 'B' };
    Registry.register(a, 'A');
    Registry.register(b, 'B');
    expect(Registry.get('A')).to.be.equal(a);
    expect(Registry.get('B')).to.be.equal(b);
    let r = Registry.unregister('A');
    expect(Registry.isRegistered('A')).to.be.equal(false);
    expect(Registry.isRegistered('B')).to.be.equal(true);
    expect(r).to.be.equal(a);
    r = Registry.unregister('A');
    expect(r).to.be.null;
    Registry.unregisterAll();
    expect(Registry.isRegistered('B')).to.be.equal(false);
    expect(Registry.get('B')).be.null;
  });
});
