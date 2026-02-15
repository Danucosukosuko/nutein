const { app, shell, Menu } = require('electron');
const { default: isDev } = require('electron-is-dev');

const events = require('./constants/events');
const { optOutPage, gdprSettings } = require('./constants/localizations');
const {
  togglePlayMenuId,
  backMenuId,
  forwardMenuId,
  checkForUpdatesId,
  optOutPageId,
  gdprSettingsId,
} = require('./constants/references');
const { privacyPolicy, terms, help } = require('./constants/externalLinks');
const { productName } = require('./constants/general');
const sendAppEvent = require('./utils/sendAppEvent');
const isMacEnvironment = require('./utils/isMacEnvironment');
const invokeWebContentsMethod = require('./utils/invokeWebContentsMethod');

const { checkForUpdatesFromMenu } = require('./updater');

function getMenuTemplate(geminiEventSender, localizations) {
  const tuneInMenuItems = [
    {
      label: 'Preferences',
      accelerator: 'CmdOrCtrl+,',
      click: () => sendAppEvent(events.navigateToAccount),
    },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => app.quit(),
    },
  ];

  const helpMenuItems = [
    {
      label: 'Privacy Policy',
      click: () => shell.openExternal(privacyPolicy),
    },
    {
      label: 'Terms',
      click: () => shell.openExternal(terms),
    },
    {
      label: 'Help',
      click: () => shell.openExternal(help),
    },
    {
      label: localizations[optOutPage],
      id: optOutPageId,
      click: () => sendAppEvent(events.navigateToOptOutPage),
      visible: false,
    },
    {
      label: localizations[gdprSettings],
      id: gdprSettingsId,
      click: () => sendAppEvent(events.openGdprSettings),
      visible: false,
    },
    {
      label: 'Check For Updates',
      id: checkForUpdatesId,
      click: checkForUpdatesFromMenu,
    },
  ];

  const viewMenuItems = [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: () => {
        invokeWebContentsMethod('reload');
      },
    },
    { role: 'forcereload' },
    { type: 'separator' },
    { role: 'resetzoom' },
    { role: 'zoomin' },
    { role: 'zoomout' },
    { type: 'separator' },
    { role: 'togglefullscreen' },
    {
      label: 'Open Web Console',
      click: () => geminiEventSender.openDevTools(),
    },
  ];

  const windowMenuItems = [
    { role: 'minimize' },
  ];

  const playbackMenuItems = [
    {
      label: 'Toggle Play',
      id: togglePlayMenuId,
      enabled: false,
      click: () => {
        // using this instead of sendAppEvent because we want to allow this
        // even if the window is minimized
        // NOTE: this can only be tested when dev-tools is not open
        invokeWebContentsMethod('send', events.playToggle);
      },
    },
    {
      label: 'Volume Up',
      accelerator: 'CmdOrCtrl+Up',
      click: () => sendAppEvent(events.volumeUp),
    },
    {
      label: 'Volume Down',
      accelerator: 'CmdOrCtrl+Down',
      click: () => sendAppEvent(events.volumeDown),
    },
  ];

  if (isDev) {
    viewMenuItems.push({ role: 'toggledevtools' });
  }

  if (isMacEnvironment()) {
    tuneInMenuItems.unshift({ role: 'about' });
    windowMenuItems.push(
      { role: 'close' },
      { role: 'hide' },
    );
  }

  return [
    {
      label: productName,
      submenu: tuneInMenuItems,
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            invokeWebContentsMethod('undo');
          },
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          click: () => {
            invokeWebContentsMethod('redo');
          },
        },
        { type: 'separator' },
        { accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { accelerator: 'CmdOrCtrl+A', role: 'selectall' },
        {
          accelerator: 'CmdOrCtrl+L',
          label: 'Search',
          click: () => sendAppEvent(events.search),
        },
      ],
    },
    {
      label: 'History',
      submenu: [
        {
          label: 'Back',
          id: backMenuId,
          accelerator: 'CmdOrCtrl+[',
          click: () => sendAppEvent(events.historyBack),
        },
        {
          label: 'Forward',
          id: forwardMenuId,
          accelerator: 'CmdOrCtrl+]',
          click: () => sendAppEvent(events.historyFwd),
        },
      ],
    },
    {
      label: 'View',
      submenu: viewMenuItems,
    },
    {
      role: 'window',
      submenu: windowMenuItems,
    },
    {
      label: 'Playback',
      submenu: playbackMenuItems,
    },
    {
      label: 'Help ',
      submenu: helpMenuItems,
    },
  ];
}

function initialize(geminiEventSender, localizations) {
  const menuTemplate = getMenuTemplate(geminiEventSender, localizations);
  const menuInstance = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menuInstance);

  return menuInstance;
}

module.exports = {
  initialize,
  getMenuTemplate, // exported for testing
};
