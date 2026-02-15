const sinon = require('sinon');
const packageJson = require('../../../package.json');
const { importWithStubs } = require('../../utils/importWithStubs');

describe('app/utils/setCustomUserAgent', () => {
  let setCustomUserAgent;
  const electronVersion = packageJson.devDependencies.electron;
  const tuneinVersion = packageJson.version;

  const getUserAgentStub = sinon.stub();
  const setUserAgentStub = sinon.stub();

  const mockSession = {
    getUserAgent: getUserAgentStub,
    setUserAgent: setUserAgentStub,
  };

  const reset = () => {
    getUserAgentStub.reset();
    setUserAgentStub.reset();
  };

  before(() => {
    setCustomUserAgent = importWithStubs('/app/utils/setCustomUserAgent', {});
  });

  describe('setCustomUserAgent should set TuneIn user agent', () => {
    before(() => {
      reset();
    });

    it('getUserAgent should be called once', () => {
      getUserAgentStub.returns('Agent-Data');

      setCustomUserAgent(mockSession);

      getUserAgentStub.should.be.calledOnce();
    });

    it('setUserAgent should be called with correct TuneIn version ', () => {
      getUserAgentStub.returns('Agent-Data TuneIn/0.0.0 Agent-Data');

      setCustomUserAgent(mockSession);

      setUserAgentStub.should.be.calledWithExactly(`Agent-Data TuneIn/${tuneinVersion} Agent-Data`);
    });

    it('setUserAgent should be called with no Electron agent ', () => {
      getUserAgentStub.returns(`Agent-Data Electron/${electronVersion} TuneIn/0.0.0 Agent-Data`);

      setCustomUserAgent(mockSession);

      setUserAgentStub.should.be.calledWithExactly(`Agent-Data TuneIn/${tuneinVersion} Agent-Data`);
    });

    it('setUserAgent should be called with Chrome agent version lock', () => {
      getUserAgentStub.returns(`Agent-Data TuneIn/0.0.0 Chrome/142.0.0.0 Agent-Data`);

      setCustomUserAgent(mockSession);

      setUserAgentStub.should.be.calledWithExactly(`Agent-Data TuneIn/${tuneinVersion} Chrome/100.6099.71 Agent-Data`);
    });
  });

  describe('if the user agent cannot be found', () => {
    before(() => {
      reset();
      getUserAgentStub.returns('');
      setCustomUserAgent(mockSession);
    });

    it('getUserAgent should be called once', () => {
      getUserAgentStub.should.be.calledOnce();
    });

    it('setUserAgent should not be called', () => {
      setUserAgentStub.should.not.be.called();
    });
  });
});
