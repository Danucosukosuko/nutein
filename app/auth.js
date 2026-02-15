const { shell } = require('electron');
const { getTIGoogleAuthUrl } = require('./utils/oauthUrlHelpers');

const openTIGoogleAuth = () => {
  const url = getTIGoogleAuthUrl();
  shell.openExternal(url);
};

module.exports = {
  openTIGoogleAuth,
};
