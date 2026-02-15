const { BrowserWindow } = require('electron');

/**
 * Function to open shareUrl in an Electron BrowserWindow. See link below for
 * BrowserWindow constructor options.
 *
 * BrowserWindow:
 *  https://electronjs.org/docs/api/browser-window#new-browserwindowoptions
 *
 * BrowserWindow Security Documentation:
 *  https://github.com/electron/electron/blob/master/docs/tutorial/security.md
 *
 * @type {Electron.BrowserWindow}
 */
function onCloseCallback(browserWindow) {
  return (event) => {
    browserWindow.hide();
    event.preventDefault();
  };
}

function openShareDialog(event, shareUrl) {
  const browserWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: false,
    modal: true,
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: false,
      devTools: false,
      sandbox: true,
      contextIsolation: true,
    },
  });
  browserWindow.loadURL(shareUrl);
  browserWindow.show();
  browserWindow.on('close', onCloseCallback(browserWindow));

  return browserWindow; // returned for testing
}

module.exports = {
  openShareDialog,
  onCloseCallback, // exported for testing
};
