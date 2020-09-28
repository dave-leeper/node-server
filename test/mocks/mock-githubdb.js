const { ContentWriter } = require('istanbul');

function Repos() {
  this.existingFiles = [];
  this.content = { data: { content: 'Mock Content.', sha: '123' } };
  this.getContentArg = {};
  this.createOrUpdateFileContentsArg = {};
  this.deleteArg = {};
  this.listCommitsArg = {};
}

Repos.prototype.getContent = function (path) {
  this.getContentArg = path;
  if (this.existingFiles.indexOf(path) === -1) {
    throw new Error('Does not exist');
  }
  return this.content;
};

Repos.prototype.createOrUpdateFileContents = function (contentInfo) {
  this.createOrUpdateFileContentsArg = contentInfo;
  this.content = { data: { content: contentInfo.content, sha: '123' } };
  this.existingFiles.push(contentInfo.path);
};

Repos.prototype.deleteFile = function (deleteArg) {
  this.deleteArg = deleteArg;
  if (this.existingFiles.indexOf(deleteArg.path) !== -1) {
    while (this.existingFiles.indexOf(deleteArg.path) !== -1) {
      this.existingFiles.splice(this.existingFiles.indexOf(deleteArg.path), 1);
    }
  }
};

Repos.prototype.listCommits = function (listCommitsArg) {
  this.listCommitsArg = listCommitsArg;
  return ['commit1'];
};

class MockGithubDB {
  constructor() {
    this.repos = new Repos();
  }
}

module.exports = MockGithubDB;
