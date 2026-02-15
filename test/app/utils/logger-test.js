const sinon = require('sinon');
const { initLogger } = require('../../../app/utils/logger');

describe('initLogger', () => {
  const webContentsStub = {
    executeJavaScript: sinon.stub(),
  };
  const originalConsoleLog = console.log;
  const expectedLogStatement = `console.log('[DEBUG]', "s123", null, 123, {"foo":"bar"}, ["baz"]);`;

  before(() => {
    initLogger({
      webContents: webContentsStub,
      logPrefix: '[DEBUG]'
    });

    console.log('s123', null, undefined, 123, { foo: 'bar' }, ['baz']);
  });

  after(() => {
    console.log = originalConsoleLog;
  });

  it('executes console log with expected args', () => {
    webContentsStub.executeJavaScript.should.be.calledOnce()
      .calledWithExactly(expectedLogStatement);
  });

  it('does not throw when evaluating log', () => {
    // test will fail if eval throws
    eval(expectedLogStatement)
  });
});
