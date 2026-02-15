const { ipcRenderer } = require('electron');
const events = require('./constants/events');
/*
 * listeners for internal electron events:
 * ipcRenderer.on('eventName', (event, message) => { window.Bridge.geminiHandler }
 */
module.exports = () => {
  // events trigged by electron menu items
  ipcRenderer.on(events.playToggle, () => {
    if (window.Bridge.handleDesktopPlayToggle) {
      window.Bridge.handleDesktopPlayToggle();
    }
  });

  ipcRenderer.on(events.volumeUp, () => {
    if (window.Bridge.handleDesktopVolumeUp) {
      window.Bridge.handleDesktopVolumeUp();
    }
  });

  ipcRenderer.on(events.volumeDown, () => {
    if (window.Bridge.handleDesktopVolumeDown) {
      window.Bridge.handleDesktopVolumeDown();
    }
  });

  ipcRenderer.on(events.historyFwd, () => {
    window.Bridge.handleDesktopHistoryFwd();
  });

  ipcRenderer.on(events.historyBack, () => {
    window.Bridge.handleDesktopHistoryBack();
  });

  ipcRenderer.on(events.navigateToAccount, () => {
    window.Bridge.handleNavigateToAccount();
  });

  ipcRenderer.on(events.navigateToOptOutPage, () => {
    window.Bridge.handleNavigateToOptOutPage();
  });

  ipcRenderer.on(events.openGdprSettings, () => {
    window.Bridge.handleOpenGdprSettings();
  });

  // listen to internal events (main.js) and send logs to gemini
  ipcRenderer.on(events.logClientError, (event, message) => {
    window.Bridge.logClientError(message);
  });

  // triggered in openFacebookAuth after successful callback
  ipcRenderer.on(events.fbAuthenticated, (event, accessToken) => {
    // pass token to gemini-web for final auth steps
    window.Bridge.handleFacebookDesktopAuthentication(accessToken);
  });

  ipcRenderer.on(events.search, () => {
    if (window.Bridge.handleDesktopSearch) {
      window.Bridge.handleDesktopSearch();
    }
  });

  // triggered in updater.js after successful update download (system-initiated)
  ipcRenderer.on(events.activateDesktopUpdateBanner, () => {
    window.Bridge.handleAvailableDesktopUpdate();
  });

  ipcRenderer.on(events.handleGoogleAuth, (event, token) => {
    window.Bridge.handleGoogleDesktopAuth(token);
  });
};
