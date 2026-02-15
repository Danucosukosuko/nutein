const { app, dialog } = require('electron');
const { default: isDev } = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const formatClientError = require('./utils/formatClientError');
const sendAppEvent = require('./utils/sendAppEvent');
const isMacEnvironment = require('./utils/isMacEnvironment');
const events = require('./constants/events');
const {
  errorKey,
  yesKey,
  noKey,
  okKey,
  updateDownloadSuccessTitleKey,
  updateDownloadSuccessMessageKey,
  updateDownloadFailMessageKey,
  updateAvailableTitleKey,
  updateAvailableMessageKey,
  updateNotAvailableTitleKey,
  updateNotAvailableMessageKey,
  updateErrorMessageKey,
  updateReadOnlyErrorMessageKey,
} = require('./constants/localizations');

const {
  enableMenuCheckForUpdates,
  disableMenuCheckForUpdates,
} = require('./utils/menuHelper');

const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
let updateTriggeredViaMenu = false;
let inUpdateFlow = false;
let quitHandler;
let geminiEventSender;
let menuInstance;
let localizations;

function quitAndInstallUpdate() {
  if (isDev) {
    dialog.showErrorBox('Auto-update Disabled', 'Auto-updates are disabled in development mode.');
    resetUpdateFlow();
    return;
  }

  inUpdateFlow = false;

  if (quitHandler) {
    quitHandler();
  }

  // The options below only affect the Windows app,
  // which serve to mimic the Mac desktop auto-update experience
  // See electron-builder auto-update docs for more info: https://www.electron.build/auto-update
  // Runs the installer in silent mode
  const isSilent = true;
  // Runs the app after finish, even in silent mode
  const isForceRunAfter = true;
  autoUpdater.quitAndInstall(isSilent, isForceRunAfter);
}

// downloadUpdate success handler
async function onDownloadUpdateSuccess() {
  try {
    await dialog.showMessageBox({
      title: localizations[updateDownloadSuccessTitleKey],
      message: localizations[updateDownloadSuccessMessageKey],
      buttons: [localizations[okKey]],
    });
    quitAndInstallUpdate();
  } catch (error) {
    logUpdaterError(error, 'onDialogError');
    resetUpdateFlow();
  }
}

// downloadUpdate failure handler, this handler is called
// only after the update is
async function onDownloadUpdateFail(error) {
  logUpdaterError(error, 'onDownloadUpdateFail');

  try {
    await dialog.showMessageBox({
      title: localizations[errorKey],
      message: localizations[updateDownloadFailMessageKey],
      buttons: [localizations[okKey]],
    });
  } catch (dialogError) {
    logUpdaterError(dialogError, 'onDialogError');
  }

  resetUpdateFlow();
}

// used by onUpdateAvailable dialog
async function onConfirmUpdate(dialogResult) {
  // Reset update flow if user selects second button = 'No'
  if (dialogResult.response !== 0) {
    resetUpdateFlow();
    return;
  }

  try {
    await autoUpdater.downloadUpdate();
    await onDownloadUpdateSuccess();
  } catch (error) {
    await onDownloadUpdateFail(error);
  }
}

// 'update-available' event handler
async function onUpdateAvailable() {
  if (inUpdateFlow || !updateTriggeredViaMenu) {
    return
  }

  inUpdateFlow = true;

  try {
    const dialogResult = await dialog.showMessageBox({
      title: localizations[updateAvailableTitleKey],
      message: localizations[updateAvailableMessageKey],
      buttons: [localizations[yesKey], localizations[noKey]],
    });
    await onConfirmUpdate(dialogResult);
  } catch (error) {
    logUpdaterError(error, 'onDialogError');
    resetUpdateFlow();
  }
}

// 'update-not-available' event handler
async function onUpdateNotAvailable() {
  if (inUpdateFlow) {
    return;
  }

  if (!updateTriggeredViaMenu) {
    resetUpdateFlow();
    return;
  }

  inUpdateFlow = true;

  try {
    await dialog.showMessageBox({
      title: localizations[updateNotAvailableTitleKey],
      message: localizations[updateNotAvailableMessageKey],
      buttons: [localizations[okKey]],
    });
    resetUpdateFlow();
  } catch (error) {
    logUpdaterError(error, 'onDialogError');
    resetUpdateFlow();
  }
}

// 'update-downloaded' event handler
function onUpdateDownloaded() {
  if (!updateTriggeredViaMenu) {
    sendAppEvent(events.activateDesktopUpdateBanner);
    enableMenuCheckForUpdates(menuInstance);
  }
}

// 'error' event handler, this error handler catches errors called from a
// user initiated update.
async function onError(error) {
  // For Windows, always assume the app is installed correctly
  const isAppInAppFolder = isMacEnvironment ? app.isInApplicationsFolder() : true;

  if (error && isAppInAppFolder) {
    logUpdaterError(error, 'onError');
  }

  if (!updateTriggeredViaMenu) {
    resetUpdateFlow();
    return;
  }

  inUpdateFlow = true;

  try {
    await dialog.showMessageBox({
      title: localizations[errorKey],
      message: !isAppInAppFolder
        ? localizations[updateReadOnlyErrorMessageKey]
        : localizations[updateErrorMessageKey],
      buttons: [localizations[okKey]],
    });
  } catch (dialogError) {
    logUpdaterError(dialogError, 'onDialogError');
  }

  resetUpdateFlow();
}

function resetUpdateFlow() {
  inUpdateFlow = false;
  enableMenuCheckForUpdates(menuInstance);
}

function logUpdaterError(error, context) {
  geminiEventSender.send(
    events.logClientError,
    formatClientError({
      message: `updater.js | ${context}`,
      error,
    }),
  );
}

function checkForUpdates() {
  disableMenuCheckForUpdates(menuInstance);
  autoUpdater.autoDownload = !updateTriggeredViaMenu;
  autoUpdater.checkForUpdates();
}

/*
 * set autoUpdater settings
 * set up handlers for update events
 */
function initAutoUpdater(installAndQuitHandler, _geminiEventSender, _menuInstance, _localizations) {
  geminiEventSender = _geminiEventSender;
  menuInstance = _menuInstance;
  localizations = _localizations;

  if (isDev) {
    // Useful for testing auto-updates in development environment (using dev-app-update.yml)
    autoUpdater.forceDevUpdateConfig = true;

    // Allow setting current version to an old version for easier updater testing
    // using app switch `--force-updater-old-version`
    const forceUpdaterOldVersion = app.commandLine.hasSwitch('force-updater-old-version');
    if (forceUpdaterOldVersion) {
      autoUpdater.currentVersion = '1.0.0';
    }
  }

  quitHandler = installAndQuitHandler;
  // autoUpdater settings
  autoUpdater.logger = log;
  autoUpdater.autoInstallOnAppQuit = false;

  // autoUpdater event listeners / handlers
  autoUpdater.on('update-available', onUpdateAvailable);
  autoUpdater.on('update-not-available', onUpdateNotAvailable);
  autoUpdater.on('update-downloaded', onUpdateDownloaded);
  autoUpdater.on('error', onError);

  // check on the first init
  checkForUpdates();
  setInterval(() => {
    // then check every day after
    updateTriggeredViaMenu = false;
    checkForUpdates();
  }, oneDayInMilliseconds);
}

/*
 * trigger checkForUpdates from app menu
 */
function checkForUpdatesFromMenu() {
  updateTriggeredViaMenu = true;
  checkForUpdates();
}

module.exports = {
  initialize: initAutoUpdater,
  checkForUpdatesFromMenu,
  quitAndInstallUpdate,

  // exported for testing
  onDownloadUpdateSuccess,
  onDownloadUpdateFail,
  onConfirmUpdate,
  onUpdateAvailable,
  onUpdateNotAvailable,
  onUpdateDownloaded,
  onError,
  checkForUpdates,
};
