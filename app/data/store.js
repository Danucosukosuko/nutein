/*
  Reference:
  https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
  https://gist.github.com/ccnokes/95cb454860dbf8577e88d734c3f31e08#file-store-js
*/
const { app, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const rendererStore = require('../constants/rendererStore');

let store;

function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet,
  // which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we
  // then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

class Store {
  constructor(opts) {
    // Renderer process has to get `app` module via `remote`,
    // whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = app.getPath('userData');
    // Use the `configName` property to set the file name and the path
    this.path = path.join(userDataPath, `${opts.configName}.json`);
    this.data = parseDataFile(this.path, opts.defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
    // Is using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Try Catch because if we used an async API and our app was quit
    // before the asynchronous write had a chance to complete,
    // we might lose that data.
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data));
    } catch {
      // fail silently
    }
  }
}

module.exports = {
  getStore: () => {
    // 'browser' is the mainProcess. We want all interactions with the store
    // to happen through the main process
    if (process.type === 'browser') {
      if (!store) {
        store = new Store({
          configName: 'user-preferences', // file-name
          defaults: {
            windowBounds: { width: 1200, height: 800 },
            rtid: '',
            partnerId: '',
          },
        });
      }
      return store;
    }
    return {
      get: key => ipcRenderer.sendSync(rendererStore.get, key),
      set: (key, value) => ipcRenderer.sendSync(rendererStore.set, key, value),
    };
  },
};
