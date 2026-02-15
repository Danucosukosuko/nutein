const { globalShortcut } = require('electron');
const { playToggle } = require('./constants/events');
const { mediaPlayPause } = require('./constants/keyboard');
const sendAppEvent = require('./utils/sendAppEvent');

module.exports = () => {
  globalShortcut.register(mediaPlayPause, () => {
    sendAppEvent(playToggle);
  });
};
