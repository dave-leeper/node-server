const Log = require('../util/log');

class Remember {
  do(reqInfo) {
    return new Promise((inResolve, inReject) => {
      const userMachine = reqInfo.clientIp;
      if (!userMachine) {
        inResolve && inResolve({ status: 404, send: { username: '' } });
        return;
      }
      // eslint-disable-next-line global-require
      const machines = require('../../private/machines/machines.json');
      for (let i = 0; i < machines.length; i++) {
        const machine = machines[i];
        if (machine.machine !== userMachine) continue;
        inResolve && inResolve({ status: 200, send: { username: machine.username } });
        return;
      }
      inResolve && inResolve({ status: 404, send: { username: '' } });
    });
  }
}
module.exports = Remember;
