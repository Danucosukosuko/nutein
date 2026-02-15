module.exports = {
  // dsktp is passed when the site is loaded so that gemini can set a
  // cookie and persist that the site has been loaded via the desktop
  isDesktopParamName: 'dsktp',
  // dsktp-rtid is passed with the device rtid if stored on the desktop
  // so that the gemini server can update it if necessary
  rtidParamName: 'dsktp-rtid',
  versionParamName: 'dsktp-version',
  osParamName: 'dsktp-os',
};
