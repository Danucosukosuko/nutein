const sendAppEvent = require('../sendAppEvent');
const { getStore } = require('../../data/store');

const { authorizePath } = require('../../constants/deepLinkRoutes');
const { rtid } = require('../../constants/store');
const events = require('../../constants/events');

function authorizeHandler({ query = {} }) {
  const store = getStore();
  if (query.serial === store.get(rtid) && query.token) {
    sendAppEvent(events.handleGoogleAuth, query.token);
  }
}

module.exports = (parsedUrl = {}) => {
  switch (parsedUrl.pathname) {
    case (authorizePath):
      authorizeHandler(parsedUrl);
      break;
    default:
      // no-op for now
      // maybe we trigger the generic error dialog from here in the future
  }
};
