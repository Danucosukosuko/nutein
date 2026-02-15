const { getStore } = require('../data/store');
const { rtid, partnerId } = require('../constants/store');
const env = require('../env.json');

const googleOauthLink = 'https://accounts.google.com/o/oauth2';
const appleOauthLink = '/oauth/apple/authorize';

const getFbUrls = (config) => {
  const { version, clientId, scope } = config;
  // this redirect is listened to by the desktop app and the auth token
  // is received through this process once facebook redirects to this uri.
  // We then close this window. Ticket to create a success page on the gemini
  // server: TUNE-14000
  const redirectUri = 'https://tunein.com';
  // filterUri has to have at least one trailing slash, so we can't use redirectUri as the filter
  const filterUri = 'https://tunein.com/*';

  return {
    authUrl: `https://www.facebook.com/v${version}/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token,granted_scopes&scope=${scope}&display=popup`,
    redirectUri,
    filterUri,
  };
};

const getTIGoogleAuthUrl = () => {
  const store = getStore();
  const serial = store.get(rtid);
  const desktopPartnerId = store.get(partnerId);
  return `https://${env.url}/desktop/auth?serial=${serial}&partnerId=${desktopPartnerId}`;
};

module.exports = {
  getFbUrls,
  getTIGoogleAuthUrl,
  googleOauthLink,
  appleOauthLink,
};
