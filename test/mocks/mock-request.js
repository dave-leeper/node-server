/**
 * @constructor
 */
function MockRequest(path) {
  this.reset(path);
}
MockRequest.prototype.reset = function (path) {
  this.path = path;
  this.params = {};
  this.query = {};
  this.files = { filename: { data: JSON.stringify({ name: 'name' }) } };
  this.headers = {};
  this.cookies = [];
};
MockRequest.prototype.header = function (name, value) {
  if (value) {
    this.headers[name] = value;
    return;
  }
  return this.headers[name];
};
MockRequest.prototype.cookie = function (name, value) {
  if (value) {
    this.cookies.push({ name, value });
    return;
  }
  for (let loop = 0; loop < this.cookies.length; loop++) {
    if (this.cookies[loop].name === name) {
      return this.cookies[loop].value; 
    }
  }
  return undefined;
};

module.exports = MockRequest;
