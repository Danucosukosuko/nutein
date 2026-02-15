const externalLinks = require('../constants/externalLinks');

// example matches:
//  https://web-gemini-web-pr-tune-12345-some-pr-description.k8s.nonprod.us-west-2.tunenet.io/oauth2/callback
//  https://stage-beta.tunein.com/oauth2/login
//  https://dev.tunein.com/oauth2/randomEndpoint
const oauthProxyRegex = new RegExp('https:\\/\\/[\\w-]+.(tunein.com|k8s.[\\w-.]+tunenet.io)\\/oauth2\\/');

module.exports = url => (
  url.hostname === externalLinks.oktaOauthHostname || oauthProxyRegex.test(url.toString())
);
