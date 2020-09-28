/* eslint-disable no-tabs */
const axios = require('axios').default;
const Encrypt = require('../util/encrypt.js');
const Log = require('../util/log');
const Registry = require('../util/registry');

// https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#web-application-flow
// https://github.com/login/oauth/authorize?client_id=c710a4e843af74a2455b&redirect_uri=https://hero-www-server.herokuapp.com/github_callback&scope=repo&state=xyz
// /github_callback?code=dc818ad0bb882076ede4&state=xyz
// clientId: e2bf54f3f87a3d0f5604a301907229a7a5f0d0764efaaccb0cc10e4a9d189e2c
// clientSecret: 8ced0a291fb4f45ba4afa81ae2a57a7eb3cde35218c19d282be75dee0c25b78dc202054b133c7869cf5d741ef80d2639
/*
  POST https://github.com/login/oauth/access_token
  client_id:      string	Required. The client ID you received from GitHub for your GitHub App.
  client_secret:  string	Required. The client secret you received from GitHub for your GitHub App.
  code:	          string	Required. The code you received as a response to Step 1.
  redirect_uri:	  string	          The URL in your application where users are sent after authorization.
  state:          string            The unguessable random string you provided in Step 1.
*/
class GithubCallback {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const { code } = reqInfo.query;
      const { state } = reqInfo.query;
      if (!code || !state) {
        const queryString = JSON.stringify(reqInfo.query);
        const error = `Required fields (code and state) not found. Params are ${queryString}`;
        if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
        inReject && inReject({ status: 400, send: error });
      }
      const crypto = Registry.get('Crypto');
      const clientId = Encrypt.decrypt('e2bf54f3f87a3d0f5604a301907229a7a5f0d0764efaaccb0cc10e4a9d189e2c', crypto.iv, crypto.key);
      const clientSecret = Encrypt.decrypt('8ced0a291fb4f45ba4afa81ae2a57a7eb3cde35218c19d282be75dee0c25b78dc202054b133c7869cf5d741ef80d2639', crypto.iv, crypto.key);

      let url = 'https://github.com/login/oauth/access_token';
      url = `${url}?client_id=${clientId}`;
      url = `${url}&client_secret=${clientSecret}`;
      url = `${url}&code=${code}`;
      url = `${url}&redirect_uri=https://hero-www-server.herokuapp.com/`;
      url = `${url}&state=${state}`;

      axios.post(url)
        .then((response) => {
          if (Log.will(Log.INFO)) Log.info(Log.stringify(response));
          inResolve && inResolve({ status: 200, send: { send: Log.stringify(response) } });
        })
        .catch((err) => {
          const error = `Error retrieving access token. ${JSON.stringify(err)}`;
          if (Log.will(Log.ERROR)) Log.error(Log.stringify(error));
          inReject && inReject({ status: 400, send: error });
        });
    });
  }
}
module.exports = GithubCallback;
