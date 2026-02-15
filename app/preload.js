const { ipcRenderer } = require('electron');
const transform = require('lodash/transform');
const events = require('./constants/events');
const { rtid, partnerId } = require('./constants/store');
const localizationKeys = require('./constants/localizations');
const { getStore } = require('./data/store');

const attachIPCListeners = require('./attachIPCListeners');
const attachMousetrapListeners = require('./attachMousetrapListeners');

const store = getStore();

/*
** in preload scripts, we have access to node.js and electron APIs
** the remote web app (tunein.com) will not, so this is safe
*/
function init() {
  // Expose a bridging API to remote app's window.
  // We'll add methods to it here first, and when the remote web app loads,
  // it'll add some additional methods as well.
  //
  // !CAREFUL! do not expose any functionality or APIs that could compromise the
  // user's computer. E.g. don't directly expose core Electron (even IPC) or node.js modules.
  window.Bridge = {};

  // *
  // * listen to events triggered by gemini-web and handle in electron
  // *

  window.Bridge.getSerial = () => store.get(rtid);

  // this function is invoked in gemini componentDidMount
  window.Bridge.setUpGeminiEventSender = () => {
    // this event is sent to main.js
    ipcRenderer.send(events.setUpGeminiEventSender);
  };

  window.Bridge.setUpLocalizations = () => {
    const getLocalizedText = window.Bridge.getLocalizedText || (v => v);
    const mapLocalizations = (mappedLocalizations, localizationKey) => {
      mappedLocalizations[localizationKey] = getLocalizedText(localizationKey);
    };
    const localizations = transform(localizationKeys, mapLocalizations, {});

    // this event is sent to main.js
    ipcRenderer.send(events.setUpLocalizations, localizations);
  };

  // GEMINI passes rtid after successful login
  window.Bridge.setSerial = (rtidValue) => {
    store.set(rtid, rtidValue);
  };

  window.Bridge.setPartnerId = (partnerIdValue) => {
    store.set(partnerId, partnerIdValue);
  };

  window.Bridge.openfacebookAuth = (fbConfig) => {
    ipcRenderer.send(events.fbAuthenticate, fbConfig);
  };

  window.Bridge.openGoogleAuth = () => {
    ipcRenderer.send(events.openGoogleAuth);
  };

  window.Bridge.enableMenuPlayPause = () => {
    ipcRenderer.send(events.enableMenuPlayPause);
  };

  window.Bridge.showOptOutPageMenuItem = () => {
    ipcRenderer.send(events.showOptOutPageMenuItem);
  };

  window.Bridge.hideOptOutPageMenuItem = () => {
    ipcRenderer.send(events.hideOptOutPageMenuItem);
  };

  window.Bridge.showGdprSettingsMenuItem = () => {
    ipcRenderer.send(events.showGdprSettingsMenuItem);
  };

  window.Bridge.hideGdprSettingsMenuItem = () => {
    ipcRenderer.send(events.hideGdprSettingsMenuItem);
  };

  window.Bridge.openSocialShare = (url) => {
    ipcRenderer.send(events.openShareDialog, url);
  };

  // invoked in gemini-web when install desktop update banner is clicked by user
  window.Bridge.quitDesktopAndInstallUpdate = () => {
    ipcRenderer.send(events.quitDesktopAndInstallUpdate);
  };

  window.Bridge.reloadPage = () => {
    ipcRenderer.send(events.reloadPage);
  };

  // listen to internal events and pass to gemini-web
  attachIPCListeners();
  attachMousetrapListeners();
}

init();
