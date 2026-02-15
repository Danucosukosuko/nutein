const Mousetrap = require('mousetrap');
const {
  space,
  volumeUp,
  volumeDown,
  search,
} = require('./constants/keyboard');
/*
 * listeners for keyboard hotkeys:
 * Using moustrap because it adds preventDefault functionality baked in
 */
module.exports = () => {
  // using moustrap for hotkeys handling because it's just better for
  // preventing default behavior
  Mousetrap.bind(space, () => {
    if (window.Bridge.handleDesktopPlayToggle) {
      window.Bridge.handleDesktopPlayToggle();
    }
    return false;
  });

  Mousetrap.bind(volumeUp, () => {
    if (window.Bridge.handleDesktopVolumeUp) {
      window.Bridge.handleDesktopVolumeUp();
    }
    return false;
  });
  Mousetrap.bind(volumeDown, () => {
    if (window.Bridge.handleDesktopVolumeDown) {
      window.Bridge.handleDesktopVolumeDown();
    }
    return false;
  });

  Mousetrap.bind(search, () => {
    if (window.Bridge.handleDesktopSearch) {
      window.Bridge.handleDesktopSearch();
    }
    return false;
  });
};
