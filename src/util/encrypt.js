const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

function Encrypt() {}

Encrypt.encrypt = function (text, iv, key) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
};

Encrypt.decrypt = function (text, iv, key) {
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

Encrypt.encryptAccount = function (account, iv, key) {
  const encryptedAccount = { ...account };
  encryptedAccount.password = Encrypt.encrypt(encryptedAccount.password, iv, key);
  return encryptedAccount;
};

Encrypt.decryptAccount = function (account, iv, key) {
  const decryptedAccount = { ...account };
  decryptedAccount.password = Encrypt.decrypt(decryptedAccount.password, iv, key);
  return decryptedAccount;
};

Encrypt.encryptAccounts = function (accounts, iv, key) {
  const encryptedAccounts = [];
  for (let i = accounts.length - 1; i >= 0; i--) {
    encryptedAccounts.push(Encrypt.encryptAccount(accounts[i], iv, key));
  }
  return encryptedAccounts;
};

Encrypt.decryptAccounts = function (accounts, iv, key) {
  const decryptedAccounts = [];
  for (let i = accounts.length - 1; i >= 0; i--) {
    decryptedAccounts.push(Encrypt.decryptAccount(accounts[i], iv, key));
  }
  return decryptedAccounts;
};

module.exports = Encrypt;
