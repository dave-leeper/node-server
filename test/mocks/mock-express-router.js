'use strict';

function MockExpressRouter ( ) {
    this.reset();
}

MockExpressRouter.prototype.reset = function ( ) {
    this.gets = [];
    this.puts = [];
    this.posts = [];
    this.patches = [];
    this.deletes = [];
    this.option = [];
};

MockExpressRouter.prototype.get = function ( path, handler ) {
    this.gets.push({ path: path, handler: handler });
};

MockExpressRouter.prototype.put = function ( path, handler ) {
    this.puts.push({ path: path, handler: handler });
};

MockExpressRouter.prototype.post = function ( path, handler ) {
    this.posts.push({ path: path, handler: handler });
};

MockExpressRouter.prototype.patch = function ( path, handler ) {
    this.patches.push({ path: path, handler: handler });
};

MockExpressRouter.prototype.delete = function ( path, handler ) {
    this.deletes.push({ path: path, handler: handler });
};

MockExpressRouter.prototype.options = function ( path, handler ) {
    this.option.push({ path: path, handler: handler });
};

module.exports = MockExpressRouter;
