const { getMainWebContents } = require('./webContents'); 

module.exports = (methodName, ...args) => {
  const mainWebContents = getMainWebContents();

  if (mainWebContents && mainWebContents[methodName]) {
    mainWebContents[methodName](...args);
  }
};
