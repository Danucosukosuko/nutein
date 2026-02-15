const electron = require('electron');
const { default: isDev } = require('electron-is-dev');
const sendAppEvent = require('./utils/sendAppEvent');
const updater = require('./updater');
const { getStore } = require('./data/store');
const { windowBounds } = require('./constants/store');
const rendererStore = require('./constants/rendererStore');
const menu = require('./menu');
const registerKeyboardShortcuts = require('./registerShortcuts');
const { openOauth } = require('./oauth.js');
const { openTIGoogleAuth } = require('./auth');
const {
  enablePlayPause,
  disableMenuHistory,
  enableMenuHistory,
  showOptOutPageMenuItem,
  hideOptOutPageMenuItem,
  showGdprSettingsMenuItem,
  hideGdprSettingsMenuItem,
} = require('./utils/menuHelper');
const { getFbUrls } = require('./utils/oauthUrlHelpers');
const setCustomUserAgent = require('./utils/setCustomUserAgent');
# const initCrashReporter = require('./utils/initCrashReporter');
const isMacEnvironment = require('./utils/isMacEnvironment');
const invokeWebContentsMethod = require('./utils/invokeWebContentsMethod');
const deepLinkEventHandler = require('./utils/deeplink/deepLinkEventHandler');
const { parseUrl } = require('./utils/url');
const { initLogger } = require('./utils/logger');
const { setMainWebContentsById, getMainWebContents } = require('./utils/webContents'); 
const { openShareDialog } = require('./shareDialog');
const env = require('./env.json');
const { productName, deepLinkProtocol } = require('./constants/general');
const events = require('./constants/events');

const { app, ipcMain, BrowserWindow } = electron;
const store = getStore();
let mainWindow = null; // should be set to null
let softClose = true;
let localizations;

initCrashReporter();

function quitHandler() {
  softClose = false; // we want the installer to fully quit the app
}

function openUrlHandler(event, eventUrl) {
  event.preventDefault();
  const parsedUrl = parseUrl(eventUrl, true);
  deepLinkEventHandler(parsedUrl);
}

function secondInstanceHandler(event, argv) {
  // Someone tried to run a second instance, we should focus our window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus({ steal: true });
  }

  // Protocol handler for win32
  // argv: An array of the second instance’s (command line / deep linked) arguments
  if (process.platform === 'win32') {
    openUrlHandler(event, argv?.find((arg) => arg?.startsWith('tunein://')));
  }
}

function setUpLocalizations(event, _localizations) {
  localizations = _localizations;
}

function onGeminiInitialization(event) {
  initLogger({
    webContents: getMainWebContents(),
    logPrefix: '[MAIN]',
  });
  const geminiEventSender = event.sender;

  // app top menu
  const menuInstance = menu.initialize(geminiEventSender, localizations);

  ipcMain.on(events.enableMenuPlayPause, () => enablePlayPause(menuInstance));
  ipcMain.on(events.showOptOutPageMenuItem, () => showOptOutPageMenuItem(menuInstance));
  ipcMain.on(events.hideOptOutPageMenuItem, () => hideOptOutPageMenuItem(menuInstance));
  ipcMain.on(events.showGdprSettingsMenuItem, () => showGdprSettingsMenuItem(menuInstance));
  ipcMain.on(events.hideGdprSettingsMenuItem, () => hideGdprSettingsMenuItem(menuInstance));
  ipcMain.on(events.reloadPage, () => invokeWebContentsMethod('reload'));

  mainWindow.on('minimize', () => disableMenuHistory(menuInstance));
  mainWindow.on('restore', () => enableMenuHistory(menuInstance));

  // auto updater
  updater.initialize(quitHandler, geminiEventSender, menuInstance, localizations);
  // gemini-web listener to handle user-initiated app update
  ipcMain.on(events.quitDesktopAndInstallUpdate, updater.quitAndInstallUpdate);
}

function setupRendererStoreProvider() {
  ipcMain.on(rendererStore.get, (event, key) => {
    event.returnValue = store.get(key);
  });

  ipcMain.on(rendererStore.set, (event, key, value) => {
    event.returnValue = store.set(key, value);
  });
}

function handleBackNav() {
  sendAppEvent(events.historyBack);
}

function handleFwdNav() {
  sendAppEvent(events.historyFwd);
}

function createAppWindow() {
  const { width: storeWidth, height: storeHeight } = store.get(windowBounds);
  const isMac = isMacEnvironment();

  setupRendererStoreProvider();

  const browserWindowOptions = {
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
    },
    title: productName,
    devTools: isDev,
    width: storeWidth,
    height: storeHeight,
    minWidth: 415,
  };

  if (isMac) {
    browserWindowOptions.titleBarStyle = 'hiddenInset';
  }

  mainWindow = new BrowserWindow(browserWindowOptions);

  setCustomUserAgent(mainWindow.webContents.session);

  // for the mac app, we don't want to quit the application when the window is closed
  if (isMac) {
    // see comment below for `before-quit` event
    mainWindow.on('close', (event) => {
      if (softClose) {
        if (mainWindow.isFullScreen()) {
          mainWindow.once('leave-full-screen', () => {
            // hide is disabled in fullscreen
            mainWindow.hide();
          });
          mainWindow.setFullScreen(false);
        } else {
          mainWindow.hide();
        }

        // when all windows are closed, the app quits
        event.preventDefault();
      }
    });
  }

  // The BrowserWindow class extends the node.js core EventEmitter class,
  // so we use that API to listen to events on the BrowserWindow.
  // The resize event is emitted when the window size changes.
  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method
    // which returns an object with the height, width, and x and y coordinates.
    const { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set(windowBounds, { width, height });
  });

  registerKeyboardShortcuts();

  // setUpLocalizations is triggered onComponentDidMount in gemini

  ipcMain.once(events.setUpLocalizations, setUpLocalizations);
  // setUpGeminiEventSender is triggered onComponentDidMount in gemini
  // Important: setUpGeminiEventSender event is emitted last in gemini-web
  // to allow localizations to be set before they are utilized when onGeminiInitialization fires

  ipcMain.once(events.setUpGeminiEventSender, onGeminiInitialization);
  // gemini-web listener to handle facebook authentication dialog

  ipcMain.on(events.fbAuthenticate, openOauth(mainWindow, getFbUrls, events.fbAuthenticated));
  // gemini-web listener to handle share dialog

  ipcMain.on(events.openShareDialog, openShareDialog);
  ipcMain.on(events.openGoogleAuth, openTIGoogleAuth);

  ipcMain.on(events.historyBack, handleBackNav);

  ipcMain.on(events.historyFwd, handleFwdNav);

  ipcMain.on(events.setMainWebContents, (event, id) => setMainWebContentsById(id));

  mainWindow.loadURL(`file://${__dirname}/index.html`);
}

function onAppCertificateError(event, webContents, url, error, certificate, callback) {
  if (url.startsWith(`https://${env.url}`)) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
}

function onAppActivation() {
  if (mainWindow === null) {
    createAppWindow();
  } else {
    mainWindow.show();
  }
}

app.name = productName;
app.on('certificate-error', onAppCertificateError);

/*
 * `activate` may trigger before 'ready', causing an exception,
 * as BrowserWindow cannot be instantiated prior to app being 'ready'
*/
app.on('ready', () => {
  createAppWindow();
  app.on('activate', onAppActivation);

  if (!app.isDefaultProtocolClient(deepLinkProtocol)) {
    app.setAsDefaultProtocolClient(deepLinkProtocol);
  }
});

/*
 * `before-quit` is triggered before mainWindow's `close` event,
 * but only for an actual `quit` action (rather than closing the window)
 * This allows us to use a flag (softClose) to indicate when we want
 * to hide the window in the background vs quit the application (mac environment only)
*/
app.on('before-quit', quitHandler);

app.on('window-all-closed', () => app.quit());

app.on('open-url', openUrlHandler);

app.on('second-instance', secondInstanceHandler);

// Force Single Instance Application
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // this gets called when someone tries to run a second instance
  // we call quit since we already have an instance running
  // and will handle the second-instance event above
  app.quit();
}

// exported for testing
module.exports = {
  quitHandler,
  openUrlHandler,
  secondInstanceHandler,
  onAppCertificateError,
  createAppWindow,
  setUpLocalizations,
  onGeminiInitialization,
  onAppActivation,
};
