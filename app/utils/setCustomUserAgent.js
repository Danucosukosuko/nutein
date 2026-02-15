const packageJson = require('../../package.json');
const { productName } = require('../constants/general');

/*
  The userAgent sets the TuneIn version to the Electron version,
  even though the Electron version is already specified.

  This util is just to overwrite that version with the actual
  TuneIn app version. The electron version is hardcoded because
  devDependencies are not available in a production build.
  Unit tests will catch it if it changes.
*/
module.exports = (session) => {
  const sessionUserAgent = session && session.getUserAgent();

  if (sessionUserAgent) {
    const { version } = packageJson;

    const getAgentFilterExpression = (agentName) => {
      return new RegExp(` ${agentName}/[^\\s]+`, 'g');
    };
 
    // The Chrome version is currently locked to keep Google SSO working.
    // This is a temporary workaround until we can update Google SSO implementation,
    // to use custom OAuth flow with regular browser instead of relying on embedded Google login
    // that is no longer allowed in webview environment.
    const getCustomUserAgent = (userAgent) => {
      return userAgent
        .replace(getAgentFilterExpression(productName), ` ${productName}/${version}`)
        // Remove Electron agent entirely
        .replace(getAgentFilterExpression('Electron'), '') 
        // Lock Chrome version
        .replace(getAgentFilterExpression('Chrome'), ' Chrome/100.6099.71'); 
    };

    session.setUserAgent(getCustomUserAgent(sessionUserAgent));
  }
};
