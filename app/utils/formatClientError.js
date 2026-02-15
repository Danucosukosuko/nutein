const isMacEnvironment = require('./isMacEnvironment');
const packageJson = require('../../package.json');

const msg = isMacEnvironment() ? 'Mac Desktop Error' : 'Windows Desktop Error';

module.exports = (error = {}) => {
  const message = [msg, packageJson.version, error.message].join(' | ');
  return {
    message,
    context: {
      error,
    },
  };
};
