function Registry() {}
Registry.registry = [];
Registry.register = function (object, name) {
  Registry.registry.unshift({ object, name });
};
Registry.unregister = function (name) {
  for (let loop = 0; loop < Registry.registry.length; loop++) {
    if (Registry.registry[loop].name === name) {
      const { object } = Registry.registry[loop];
      Registry.registry.splice(loop, 1);
      return object;
    }
  }
  return null;
};
Registry.unregisterAll = function () {
  Registry.registry = [];
};
Registry.isRegistered = function (name) {
  for (let loop = 0; loop < Registry.registry.length; loop++) {
    if (Registry.registry[loop].name === name) return true;
  }
  return false;
};
Registry.get = function (name) {
  for (let loop = 0; loop < Registry.registry.length; loop++) {
    if (Registry.registry[loop].name === name) return Registry.registry[loop].object;
  }
  return null;
};
Registry.getUserAccount = function (username) {
  const accounts = Registry.get('Accounts');
  if (!accounts) return null;
  for (let i = accounts.length - 1; i >= 0; i--) {
    if (username.toUpperCase() === accounts[i].username.toUpperCase()) {
      return accounts[i];
    }
  }
  return null;
};

module.exports = Registry;
