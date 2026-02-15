const sinon = require('sinon');
const { importWithStubs } = require('../../utils/importWithStubs');

const PATH = '/app/utils/formatClientError';

describe(PATH, () => {
  let formatClientError;
  const isMacEnvironmentStub = sinon.stub();
  const packageJsonStub = { version: '1.0' };
  const error = new Error('test');

  const importModule = () => importWithStubs(PATH, {
    './isMacEnvironment': isMacEnvironmentStub,
    '../../package.json': packageJsonStub,
  });

  describe('when in Mac environment', () => {
    before(() => {
      isMacEnvironmentStub.returns(true);
      formatClientError = importModule();
    });

    it('returns the expected value', () => {
      formatClientError(error).should.eql({
        message: `Mac Desktop Error | 1.0 | test`,
        context: {
          error,
        }
      })
    });
  });

  describe('when in Windows environment', () => {
    before(() => {
      isMacEnvironmentStub.returns(false);
      formatClientError = importModule();
    });

    it('returns the expected value', () => {
      formatClientError(error).should.eql({
        message: `Windows Desktop Error | 1.0 | test`,
        context: {
          error,
        }
      })
    });
  });
});
