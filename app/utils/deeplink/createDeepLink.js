const { deepLinkProtocol } = require('../../constants/general');

module.exports = path => `${deepLinkProtocol}://tunein.com${path}`;
