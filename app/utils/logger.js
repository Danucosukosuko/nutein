function getWebContentsInstance(webContentsInstance) {
  return webContentsInstance.getFocusedWebContents() || webContentsInstance.getAllWebContents()[0];
}

function initLogger({ webContents, logPrefix }) {
  const webContentsInstance = webContents.executeJavaScript
    ? webContents
    : getWebContentsInstance(webContents);

  console.log = (...args) => webContentsInstance.executeJavaScript(
    `console.log('${logPrefix}', ${args.map(arg => JSON.stringify(arg)).filter(Boolean).join(', ')});`,
  );
}

module.exports = { initLogger };
