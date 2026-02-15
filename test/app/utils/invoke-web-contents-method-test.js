const sinon = require('sinon');
const { importWithStubs } = require('../../utils/importWithStubs');

const PATH = '/app/utils/invokeWebContentsMethod';

describe(PATH, () => {
  let invokeWebContentsMethod;
  let webContentsInstanceStub;
  let getMainWebContentsStub;

  before(() => {
    webContentsInstanceStub = {
      method: sinon.stub(),
    };
    getMainWebContentsStub = sinon.stub().returns(webContentsInstanceStub);

    invokeWebContentsMethod = importWithStubs(PATH, {
      './webContents': { getMainWebContents: getMainWebContentsStub },
    });
  });

  describe('when getMainWebContents() returns a webContents instance', () => {
    describe('when methodName exists on webContents instance', () => {
      before(() => {
        invokeWebContentsMethod('method', 1, 2, 3);
      });

      after(() => {
        webContentsInstanceStub.method.reset();
      });

      it('calls method with expected args', () => {
        webContentsInstanceStub.method.should.be.calledOnce()
          .calledWithExactly(1, 2, 3);
      });
    });

    describe('when methodName does not exist on webContents instance', () => {
      before(() => {
        invokeWebContentsMethod('invalidMethod', 1, 2, 3);
      });

      it('does not call method', () => {
        webContentsInstanceStub.method.should.not.be.called();
      });
    });
  });

  describe('when getMainWebContents() does not return a webContents instance', () => {
    before(() => {
      getMainWebContentsStub.returns(undefined);
      invokeWebContentsMethod('invalidMethod', 1, 2, 3);
    });

    after(() => {
      getMainWebContentsStub.reset();
    });

    it('does not call method', () => {
      webContentsInstanceStub.method.should.not.be.called();
    });
  });
});
