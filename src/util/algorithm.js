/* eslint-disable no-param-reassign */
const oneTruthyReduce = (accumulator, currentValue) => {
  if (accumulator) return accumulator;
  return currentValue;
};
const manyTruthyReduce = (accumulator, currentValue) => {
  if (!Array.isArray(accumulator)) {
    const x = accumulator;
    accumulator = [];
    if (x) accumulator.push(x);
  }
  if (currentValue) accumulator.push(currentValue);
  return accumulator;
};
const arrayContainsObject = (array, object) => {
  if (!array || !Array.isArray(array) || !array.length) return false;
  for (let loop = 0; loop < array.length; loop++) {
    if (array[loop] === object) return true;
  }
  return false;
};
const uniqueReduce = (accumulator, currentValue) => {
  if (!Array.isArray(accumulator)) accumulator = [accumulator];
  if (arrayContainsObject(accumulator, currentValue)) return accumulator;
  accumulator.push(currentValue);
  return accumulator;
};
const mapAllExecept = (keep, replacement) => (item) => { if (item === keep) return item; return replacement; };

module.exports.oneTruthyReduce = oneTruthyReduce;
module.exports.manyTruthyReduce = manyTruthyReduce;
module.exports.uniqueReduce = uniqueReduce;
module.exports.mapAllExecept = mapAllExecept;
module.exports.arrayContainsObject = arrayContainsObject;
