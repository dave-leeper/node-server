
function MockResponse() {
  this.reset();
}
MockResponse.prototype.reset = function () {
  this.sendString = null;
  this.sendfile = null;
  this.renderString = null;
  this.renderObject = null;
  this.sendStatus = 0;
  this.headers = [];
  this.cookies = [];
};
MockResponse.prototype.send = function (send) {
  this.sendString = send;
};
MockResponse.prototype.sendFile = function (send) {
  this.sendfile = send;
};
MockResponse.prototype.render = function (render, object) {
  this.renderString = render;
  this.renderObject = object;
};
MockResponse.prototype.header = function (name, value) {
  if (value) {
    this.headers.push({ header: name, value });
    return;
  }
  for (let loop = 0; loop < this.headers.length; loop++) { if (this.headers[loop].header === name) return this.headers[loop].value; }
  return undefined;
};
MockResponse.prototype.cookie = function (name, value, age) {
  if (value) {
    if (age) this.cookies.push({ name, value, age });
    else this.cookies.push({ name, value });
    return;
  }
  for (let loop = 0; loop < this.cookies.length; loop++) { if (this.cookies[loop].name === name) return this.cookies[loop].value; }
  return undefined;
};
MockResponse.prototype.status = function (status) {
  this.sendStatus = status;
};

module.exports = MockResponse;
