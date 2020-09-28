// @formatter:off


const chai = require('chai');

const { expect } = chai;

const algorithm = require('../../../src/util/algorithm');

describe('As a developer, I need to be able to use common algorithms.', () => {
  before(() => {
  });
  beforeEach(() => {
  });
  afterEach(() => {
  });
  after(() => {
  });

  it('should reduce arrays to a single truthy value', () => {
    let array = [false, false, null, undefined, 0, 'dog'];
    let result = array.reduce(algorithm.oneTruthyReduce);
    expect(result).to.be.equal('dog');

    array = [false, false, 'cat', null, undefined, 0, 'dog'];
    result = array.reduce(algorithm.oneTruthyReduce);
    expect(result).to.be.equal('cat');

    array = ['goldfish', false, false, 'cat', null, undefined, 0, 'dog'];
    result = array.reduce(algorithm.oneTruthyReduce);
    expect(result).to.be.equal('goldfish');

    array = [false, null, undefined, 0];
    result = array.reduce(algorithm.oneTruthyReduce);
    expect(result).to.be.equal(0);
    expect(result).not.to.be.equal(false);
    expect(result).not.to.be.equal(null);
    expect(result).not.to.be.equal(undefined);

    array = [0, null, undefined, false];
    result = array.reduce(algorithm.oneTruthyReduce);
    expect(result).to.be.equal(false);
    expect(result).not.to.be.equal(0);
    expect(result).not.to.be.equal(null);
    expect(result).not.to.be.equal(undefined);
  });

  it('should reduce arrays to a multiple truthy value', () => {
    let array = [false, false, null, undefined, 0, 'dog'];
    let result = array.reduce(algorithm.manyTruthyReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(1);
    expect(result[0]).to.be.equal('dog');

    array = [false, false, 'cat', null, undefined, 0, 'dog'];
    result = array.reduce(algorithm.manyTruthyReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(2);
    expect(result[0]).to.be.equal('cat');
    expect(result[1]).to.be.equal('dog');

    array = ['goldfish', false, false, 'cat', null, undefined, 0, 'dog'];
    result = array.reduce(algorithm.manyTruthyReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(3);
    expect(result[0]).to.be.equal('goldfish');
    expect(result[1]).to.be.equal('cat');
    expect(result[2]).to.be.equal('dog');

    array = [false, null, undefined, 0];
    result = array.reduce(algorithm.manyTruthyReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(0);

    array = [0, null, undefined, false];
    result = array.reduce(algorithm.manyTruthyReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(0);
  });

  it('should replace all array elements not matching a value', () => {
    let array = [false, false, null, undefined, 0, 'dog'];
    let result = array.map(algorithm.mapAllExecept('dog', 'cat'));
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(6);
    expect(result[0]).to.be.equal('cat');
    expect(result[1]).to.be.equal('cat');
    expect(result[2]).to.be.equal('cat');
    expect(result[3]).to.be.equal('cat');
    expect(result[4]).to.be.equal('cat');
    expect(result[5]).to.be.equal('dog');
    array = [false, false, 'dog', undefined, 0, 'dog'];
    result = array.map(algorithm.mapAllExecept('dog', 'cat'));
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(6);
    expect(result[0]).to.be.equal('cat');
    expect(result[1]).to.be.equal('cat');
    expect(result[2]).to.be.equal('dog');
    expect(result[3]).to.be.equal('cat');
    expect(result[4]).to.be.equal('cat');
    expect(result[5]).to.be.equal('dog');
    array = ['dog', false, 'dog', undefined, 0, 'dog'];
    result = array.map(algorithm.mapAllExecept('dog', 'cat'));
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(6);
    expect(result[0]).to.be.equal('dog');
    expect(result[1]).to.be.equal('cat');
    expect(result[2]).to.be.equal('dog');
    expect(result[3]).to.be.equal('cat');
    expect(result[4]).to.be.equal('cat');
    expect(result[5]).to.be.equal('dog');
  });

  it('should indicate if an array contains a specific value', () => {
    let array = [false, false, null, undefined, 0, 'dog'];
    let result = algorithm.arrayContainsObject(array, 'dog');
    expect(result).to.be.equal(true);
    array = [false, false, 'dog', undefined, 0, null];
    result = algorithm.arrayContainsObject(array, 'dog');
    expect(result).to.be.equal(true);
    array = ['dog', false, false, undefined, 0, null];
    result = algorithm.arrayContainsObject(array, 'dog');
    expect(result).to.be.equal(true);
    result = algorithm.arrayContainsObject(array, 'cat');
    expect(result).to.be.equal(false);
  });

  it('should create unique-value arrays from an array', () => {
    let array = [false, false, null, undefined, 0, 'dog'];
    let result = array.reduce(algorithm.uniqueReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(5);
    expect(result[0]).to.be.equal(false);
    expect(result[1]).to.be.equal(null);
    expect(result[2]).to.be.equal(undefined);
    expect(result[3]).to.be.equal(0);
    expect(result[4]).to.be.equal('dog');
    array = [false, false, 'dog', null, undefined, 0, 'dog'];
    result = array.reduce(algorithm.uniqueReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(5);
    expect(result[0]).to.be.equal(false);
    expect(result[1]).to.be.equal('dog');
    expect(result[2]).to.be.equal(null);
    expect(result[3]).to.be.equal(undefined);
    expect(result[4]).to.be.equal(0);
    array = ['dog', false, false, 'dog', null, undefined, 0, 'dog'];
    result = array.reduce(algorithm.uniqueReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(5);
    expect(result[0]).to.be.equal('dog');
    expect(result[1]).to.be.equal(false);
    expect(result[2]).to.be.equal(null);
    expect(result[3]).to.be.equal(undefined);
    expect(result[4]).to.be.equal(0);
    array = ['dog', false, false, 'dog', null, undefined, 0];
    result = array.reduce(algorithm.uniqueReduce);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(5);
    expect(result[0]).to.be.equal('dog');
    expect(result[1]).to.be.equal(false);
    expect(result[2]).to.be.equal(null);
    expect(result[3]).to.be.equal(undefined);
    expect(result[4]).to.be.equal(0);
  });
});
