const { getMainWebContents } = require('./webContents'); 

module.exports = (eventName, args) => {
  const mainWebContents = getMainWebContents();

  if (mainWebContents) {
    mainWebContents.send(eventName, args);
  }
};
