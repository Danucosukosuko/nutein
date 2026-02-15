const { crashReporter } = require('electron');
const packageJson = require('../../package.json');
const { getStore } = require('../data/store');
const { productName } = require('../constants/general');
const { rtid } = require('../constants/store');
const isMacEnvironment = require('../utils/isMacEnvironment');
const env = require('../env.json');

const store = getStore();
const geminiServer = (env.url.indexOf('localhost') === 0)
  ? 'http://127.0.0.1:3000'
  : `https://${env.url}`;

const desktopEnvironment = isMacEnvironment() ? 'MacOS' : 'Windows';
/*
  initCrashReporter
  This needs to be initialized in main.js and on every render process.
*/
module.exports = () => {
  crashReporter.start({
    compress: true,
    productName: `${productName} ${desktopEnvironment}`,
    submitURL: `${geminiServer}/api/v1/desktop/logCrashReport`,
    extra: {
      tuneInAppVersion: packageJson.version,
      rtid: store.get(rtid),
    },
    companyName: productName,
    globalExtra: { _companyName: productName },
  });
};
