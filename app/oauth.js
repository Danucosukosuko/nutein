const { BrowserWindow } = require('electron');
const throttle = require('lodash/throttle');

const ACCESS_TOKEN_PARAM = 'access_token=';
const ACCESS_DENIED_PARAM = 'error=access_denied';
// https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow

const oauthMethods = {
  getAccessToken(url) {
    // we need to parse out the token this way because it might not be the first param returned
    const splitUrls = url.split(ACCESS_TOKEN_PARAM);
    const accessTokenString = splitUrls[1];
    const accessTokenEndIndex = accessTokenString.indexOf('&');
    return accessTokenEndIndex === -1
      ? accessTokenString.substring(0)
      : accessTokenString.substring(0, accessTokenEndIndex);
  },

  // handler to listen to callbacks from google and facebook logins
  oauthResponseHandler(callback, { url }) {
    if (url.includes(ACCESS_TOKEN_PARAM)) {
      // user completes successful auth
      const accessToken = oauthMethods.getAccessToken(url);
      if (accessToken) {
        callback(accessToken);
      }
    } else if (url.indexOf(ACCESS_DENIED_PARAM) !== -1) {
      callback(); // close on cancel for facebook instead of ugly error message
    }
  },

  urlCompleteHandler(filterUri, callback) {
    oauthMethods.filter = { urls: [filterUri] };
    return oauthMethods.oauthResponseHandler.bind(oauthMethods, callback);
  },

  openOauth(mainWindow, getOauthUrls, completionEvent) {
    // using throttle and setting wait time to 2 seconds to
    // prevent user from opening multiple oauth dialogs
    return throttle((event, config) => {
      const urls = getOauthUrls(config);

      const authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: false,
        parent: mainWindow,
        alwaysOnTop: true,
        webPreferences: {
          enableRemoteModule: false,
          nodeIntegration: false,
          partition: 'oauth',
          contextIsolation: false,
        },
      });

      const { session } = authWindow.webContents;

      authWindow.once('ready-to-show', authWindow.show);

      authWindow.once('show', () => {
        mainWindow.once('focus', () => !authWindow.isDestroyed() && authWindow.close());
      });

      authWindow.loadURL(urls.authUrl);

      function oauthCallback(accessToken) {
        // Passing null as `listener` will unsubscribe from event
        // https://github.com/electron/electron/blob/v4.2.8/docs/api/web-request.md
        session.webRequest.onCompleted(oauthMethods.filter, null);

        if (accessToken) {
          // internal event that the ipcRender listens to and passes on to gemini-web
          event.sender.send(completionEvent, accessToken);
        }
        authWindow.close();
        session.clearStorageData();
      }

      const listener = oauthMethods.urlCompleteHandler(urls.filterUri, oauthCallback);

      // this listens to requests while the app is running, so need a strict filter
      session.webRequest.onCompleted(oauthMethods.filter, listener);
    }, 2000, { trailing: false });
  },
};

module.exports = {
  openOauth: oauthMethods.openOauth,
  getAccessToken: oauthMethods.getAccessToken,

  // exported for testing
  oauthMethods,
};
