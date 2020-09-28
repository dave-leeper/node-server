const { Octokit } = require('@octokit/rest');

const build = (token) => {
  const octokit = new Octokit({ auth: token });
  return octokit;
};

module.exports = build;
