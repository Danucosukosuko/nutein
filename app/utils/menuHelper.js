const {
  togglePlayMenuId,
  backMenuId,
  forwardMenuId,
  checkForUpdatesId,
  optOutPageId,
  gdprSettingsId,
} = require('../constants/references');

const menuHelper = {
  enableMenuOption(menu, menuItemId) {
    const menuItem = menu.getMenuItemById(menuItemId);
    if (menuItem) {
      menuItem.enabled = true;
    }
  },

  disableMenuOption(menu, menuItemId) {
    const menuItem = menu.getMenuItemById(menuItemId);
    if (menuItem) {
      menuItem.enabled = false;
    }
  },

  enablePlayPause(menu) {
    menuHelper.enableMenuOption(menu, togglePlayMenuId);
  },

  disableMenuHistory(menu) {
    menuHelper.disableMenuOption(menu, backMenuId);
    menuHelper.disableMenuOption(menu, forwardMenuId);
  },

  enableMenuHistory(menu) {
    menuHelper.enableMenuOption(menu, backMenuId);
    menuHelper.enableMenuOption(menu, forwardMenuId);
  },

  enableMenuCheckForUpdates(menu) {
    menuHelper.enableMenuOption(menu, checkForUpdatesId);
  },

  disableMenuCheckForUpdates(menu) {
    menuHelper.disableMenuOption(menu, checkForUpdatesId);
  },

  showOptOutPageMenuItem(menu) {
    const optOutPageMenuItem = menu.getMenuItemById(optOutPageId);
    if (optOutPageMenuItem) {
      optOutPageMenuItem.visible = true;
    }
  },

  hideOptOutPageMenuItem(menu) {
    const optOutPageMenuItem = menu.getMenuItemById(optOutPageId);
    if (optOutPageMenuItem) {
      optOutPageMenuItem.visible = false;
    }
  },

  showGdprSettingsMenuItem(menu) {
    const gdprSettingsMenuItem = menu.getMenuItemById(gdprSettingsId);
    if (gdprSettingsMenuItem) {
      gdprSettingsMenuItem.visible = true;
    }
  },

  hideGdprSettingsMenuItem(menu) {
    const gdprSettingsMenuItem = menu.getMenuItemById(gdprSettingsId);
    if (gdprSettingsMenuItem) {
      gdprSettingsMenuItem.visible = false;
    }
  },
};

module.exports = menuHelper;
