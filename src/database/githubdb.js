/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable-next-line global-require */
/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable import/order */
const Encrypt = require('../util/encrypt.js');
const Log = require('../util/log.js');
const Registry = require('../util/registry.js');

// https://octokit.github.io/rest.js/v18#usage
// https://blog.dennisokeeffe.com/blog/2020-06-22-using-octokit-to-create-files/
/**
 * @param name - name of the connection.
 * @constructor
 */
class GithubDB {
  constructor(name) {
    this.name = name;
    this.config = null;
    this.client = null;
    const crypto = Registry.get('Crypto');
    this.token = Encrypt.decrypt('5ee0c6633e795b9eaa9b77fb1988a3a5a5c786994d65be67f4934fd0ec4320e58f80d03b4ba2e240cd21876dc37af152', crypto.iv, crypto.key);
  }

  /**
   * @param config - database config.
   * @constructor
   */
  async connect(config) {
    try {
      if (!config || !config.config || !config.config.owner || !config.config.repo || !config.config.committer || !config.config.author) {
        const error = { status: false, error: 'GithubDB: Error while connecting. Invalid config.' };
        if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
        throw error;
      }
      this.config = config.config;
      const getOctoKit = () => {
        const factoryPath = `./${config.factory}`;
        const factory = require(factoryPath);
        const octokit = factory(this.token);
        return octokit;
      };
      this.client = getOctoKit();
      return this.client;
    } catch (err) {
      const error = { status: false, error: `GithubDB: Error while connecting. General error. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async ping() {
    if (!this.client) {
      return false;
    }
    const result = await this.fileExists('.___');
    return result;
  }

  async disconnect() {
    this.client = null;
    return true;
  }

  async lock(path) {
    const lockFileBase = '.___lock_';
    const lockFile = `${lockFileBase}${path}`;
    const startTime = new Date();

    // eslint-disable-next-line no-await-in-loop
    while (await this.isLocked(path)) {
      const now = new Date();
      const beenWaiting = Math.abs(now - startTime);
      const beenWaitingMinutes = (beenWaiting / 1000) / 60;

      if (beenWaitingMinutes < 2) {
        // eslint-disable-next-line no-await-in-loop
        await this.sleep(500);
      } else {
        await this.prototype.unlock(path);
      }
    }
    await this.insert(lockFile, lockFile);
  }

  async isLocked(path) {
    const lockFileBase = '.___lock_';
    const lockExists = await this.fileExists(`${lockFileBase}${path}`);
    return lockExists;
  }

  async unlock(path) {
    const lockExists = await this.isLocked(path);
    if (lockExists) {
      const lockFileBase = '.___lock_';
      await this.delete(`${lockFileBase}${path}`);
    }
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async collectionExists(path) {
    return this.fileExists(`${path}/.___`);
  }

  /**
   * @param name - The collection name.
   * @returns {Promise}
   */
  async createCollection(path) {
    return this.insert(`${path}/.___`, path);
  }

  async dropCollection(path) {
    try {
      const fileArray = await this.readCollection(path);
      for (let fileIndex = 0; fileIndex < fileArray.length; fileIndex++) {
        const file = fileArray[fileIndex];
        // eslint-disable-next-line no-await-in-loop
        const fileExists = await this.fileExists(file.path);
        if (fileExists) {
          // eslint-disable-next-line no-await-in-loop
          await this.delete(file.path);
        }
      }
      return { status: true };
    } catch (err) {
      const error = { status: false, error: `Error while dropping collection ${path}. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async readCollection(path) {
    try {
      const octokit = this.client;
      const { owner, repo } = this.config;
      const content = await octokit.repos.getContent({ owner, repo, path });
      return content.data;
    } catch (err) {
      const error = { status: false, error: `Error while reading collection ${path}. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async getSHA(path) {
    const octokit = this.client;
    const { owner, repo } = this.config;
    let content = await octokit.repos.getContent({ owner, repo, path });
    if (typeof content === 'string') {
      content = JSON.parse(content);
    }
    return content.data.sha;
  }

  async fileExists(path) {
    const octokit = this.client;
    try {
      const { owner, repo } = this.config;
      const content = await octokit.repos.getContent({ owner, repo, path });
      return true;
    } catch (e) {
      return false;
    }
  }

  async insert(path, data) {
    try {
      const octokit = this.client;
      const {
        owner, repo, committer, author,
      } = this.config;
      const message = 'Inserted';
      const buff = Buffer.from(data, 'utf-8');
      const content = buff.toString('base64');
      await octokit.repos.createOrUpdateFileContents({
        owner, repo, path, message, content, committer, author,
      });
      return { status: true };
    } catch (err) {
      const error = { status: false, error: `Error while inserting data to ${path}. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async upsert(path, data) {
    const fileExists = await this.fileExists(path);
    if (!fileExists) {
      return this.insert(path, data);
    }
    return this.update(path, data);
  }

  async update(path, data) {
    try {
      const octokit = this.client;
      const {
        owner, repo, committer, author,
      } = this.config;
      const message = 'Updated';
      const sha = await this.getSHA(path);
      const buff = Buffer.from(data, 'utf-8');
      const content = buff.toString('base64');
      await octokit.repos.createOrUpdateFileContents(
        {
          owner, repo, path, message, sha, content, committer, author,
        },
      );
      return { status: true };
    } catch (err) {
      const error = { status: false, error: `Error while updating data to ${path}. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async delete(path) {
    try {
      const octokit = this.client;
      const { owner, repo } = this.config;
      const message = 'Deleted';
      const sha = await this.getSHA(path);
      await octokit.repos.deleteFile({
        owner, repo, path, message, sha,
      });
      return { status: true };
    } catch (err) {
      const error = { status: false, error: `Error while deleting data from ${path}. ${JSON.stringify(err)} ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async read(path) {
    try {
      const octokit = this.client;
      const { owner, repo } = this.config;
      const response = await octokit.repos.getContent({ owner, repo, path });
      const buff = Buffer.from(response.data.content, 'base64');
      const content = buff.toString();
      return content;
    } catch (err) {
      const error = { status: false, error: `Error while reading data from ${path}. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async createBlob(content, encoding) {
    try {
      const octokit = this.client;
      const { owner, repo } = this.config;
      const newBlob = await octokit.git.createBlob({
        owner,
        repo,
        content,
        encoding,
      });
      const newBlobSha = newBlob.data.sha;
      return { newBlob, newBlobSha };
    } catch (err) {
      const error = { status: false, error: `Error while creating blob. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async createCommit(message, tree, parents) {
    try {
      const octokit = this.client;
      const { owner, repo } = this.config;
      const newCommit = await octokit.git.createCommit({
        owner,
        repo,
        message,
        tree,
        parents,
      });
      const newCommitSha = newCommit.data.sha;
      return { newCommit, newCommitSha };
    } catch (err) {
      const error = { status: false, error: `Error while creating commit. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async getCommit(refSha) {
    try {
      const octokit = this.client;
      const { owner, repo } = this.config;
      const commit = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: refSha,
      });
      const commitTreeSha = commit.data.tree.sha;
      return { commit, commitTreeSha };
    } catch (err) {
      const error = { status: false, error: `Error while getting commit. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async listCommits(path) {
    try {
      const octokit = this.client;
      const { owner, repo } = this.config;
      const content = await octokit.repos.listCommits({ owner, repo, path });
      return content.data;
    } catch (err) {
      const error = { status: false, error: `Error while reading commits from ${path}. ${JSON.stringify(err)}` };
      if (Log.will(Log.ERROR)) Log.error(JSON.stringify(error));
      throw error;
    }
  }

  async getRef(ref) {
    const octokit = this.client;
    const { owner, repo } = this.config;
    const theRef = await octokit.git.getRef({
      owner,
      repo,
      ref,
    });
    const refSha = theRef.data.object.sha;
    return { ref: theRef, refSha };
  }

  async updateRef(ref, sha) {
    const octokit = this.client;
    const { owner, repo } = this.config;
    const updatedRef = octokit.git.updateRef({
      owner,
      repo,
      ref,
      sha,
    });
  }

  async createTree(treeNodeArray) {
    const octokit = this.client;
    const { owner, repo } = this.config;
    const newTree = await octokit.git.createTree({
      owner,
      repo,
      tree: treeNodeArray,
    });
    const newTreeSha = newTree.data.sha;
    return { newTree, newTreeSha };
  }

  async getTree(commitSha, recursive) {
    const octokit = this.client;
    const { owner, repo } = this.config;
    const rawTree = (recursive)
      ? await octokit.git.getTree({
        owner,
        repo,
        recursive: true,
        tree_sha: commitSha,
      })
      : await octokit.git.getTree({
        owner,
        repo,
        tree_sha: commitSha,
      });
    const { tree } = rawTree.data;
    const treeSha = rawTree.data.sha;
    return { treeNodeArray: tree, treeSha };
  }

  //  The file mode; one of
  //    100644 for file (blob),
  //    100755 for executable (blob),
  //    040000 for subdirectory (tree),
  //    160000 for submodule (commit), or
  //    120000 for a blob that specifies the path of a symlink.
  addFileToTreeNodeArray(treeNodeArray, path, type, sha, baseTree) {
    const node = {
      path,
      mode: '100644',
      type,
      sha,
      base_tree: baseTree,
    };
    const treeNodeArrayClone = [...treeNodeArray];
    treeNodeArrayClone.push(node);
    return treeNodeArrayClone;
  }

  async removeFileFromTreeNodeArray(treeNodeArray, path) {
    const treeNodeArrayClone = [...treeNodeArray];
    for (let nodeIndex = 0; nodeIndex < treeNodeArrayClone.length; nodeIndex++) {
      const node = treeNodeArrayClone[nodeIndex];
      if (node.path === path) {
        treeNodeArrayClone.splice(nodeIndex, 1);
        return treeNodeArrayClone;
      }
    }
    return treeNodeArrayClone;
  }

  async updateFileInTreeNodeArray(treeNodeArray, path, type, sha, baseTree) {
    let treeNodeArrayClone = this.removeFileFromTreeNodeArray(treeNodeArray, path);
    treeNodeArrayClone = this.addFileToTreeNodeArray(treeNodeArray, path, type, sha, baseTree);

    return treeNodeArrayClone;
  }

  async treeTest() {
    const octokit = this.client;
    const { owner, repo } = this.config;
    const masterRef = 'heads/master';
    const filename = 'test2';

    const { ref, refSha } = await this.getRef(masterRef);
    const { commit, commitTreeSha } = await this.getCommit(refSha);
    const { newBlob, newBlobSha } = await this.createBlob('text', 'utf-8');
    let { treeNodeArray } = await this.getTree(commitTreeSha);
    treeNodeArray = this.addFileToTreeNodeArray(treeNodeArray, filename, 'blob', newBlobSha, commitTreeSha);
    const { newTree, newTreeSha } = await this.createTree(treeNodeArray);
    const message = 'Committed via Octokit!';
    const { newCommit, newCommitSha } = await this.createCommit(message, newTreeSha, [refSha]);

    await this.updateRef(masterRef, newCommitSha);
  }
}

module.exports = GithubDB;
