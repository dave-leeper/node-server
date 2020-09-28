let Server = require('./server.js');
let port = process.env.NODE_SERVER_PORT || process.env.PORT || '3000';
let server = new Server().init(port, './src/config', null);
module.exports = server;
