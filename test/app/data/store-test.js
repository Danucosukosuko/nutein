const sinon = require('sinon');
const { rewireWithStubs, resetRewire } = require('../../utils/importWithStubs');
const { get, set } = require('../../../app/constants/rendererStore');

const readFileSyncStub = sinon.stub();
const writeFileSyncStub = sinon.stub();
const ipcRendererStub = {
  sendSync: sinon.stub(),
};
const PATH_TO_PREFERENCES = 'some/path/';
const appStub = {
  getPath: sinon.stub().returns(PATH_TO_PREFERENCES),
};
const remoteStub = sinon.stub();
const globalDirNameCache = __dirname;

describe('app/data/store', () => {
  let store;
  function setupBefore() {
    // eslint-disable-next-line no-global-assign
    __dirname = __dirname.replace(/test\//, '');
    store = rewireWithStubs('/app/data/store', {
      electron: {
        ipcRenderer: ipcRendererStub,
        app: appStub,
        remote: remoteStub,
      },
      fs: {
        readFileSync: readFileSyncStub,
        writeFileSync: writeFileSyncStub,
      },
    });
  }

  function cleanupAfter() {
    // eslint-disable-next-line no-global-assign
    __dirname = globalDirNameCache;
    resetRewire();
  }

  describe('store', () => {
    before(setupBefore);

    after(cleanupAfter);

    describe('.getStore when process.type !== `browser`', () => {
      before(() => {
        process.type = 'not a browser';
      });

      beforeEach(() => {
        ipcRendererStub.sendSync.reset();
      });

      after(() => {
        process.type = undefined;
      });

      it('when calling get', () => {
        const key = 'some key';
        store.getStore().get(key);
        ipcRendererStub.sendSync.should.be.calledOnce().calledWithExactly(get, key);
      });

      it('when calling set', () => {
        const key = 'some key';
        const val = 'some val';
        store.getStore().set(key, val);
        ipcRendererStub.sendSync.should.be.calledOnce().calledWithExactly(set, key, val);
      });
    });

    describe('.getStore when process.type === `browser`', () => {
      before(() => {
        process.type = 'browser';
      });

      beforeEach(() => {
        ipcRendererStub.sendSync.reset();
      });

      after(() => {
        process.type = undefined;
      });

      it('when calling get', () => {
        const key = 'some key';
        store.getStore().get(key);
        ipcRendererStub.sendSync.should.not.be.called();
        appStub.getPath.should.be.calledOnce().calledWithExactly('userData');
        readFileSyncStub.should.be.calledOnce().calledWith(`${PATH_TO_PREFERENCES}user-preferences.json`);
      });

      it('when calling set', () => {
        const key = 'someKey';
        const val = 'some val';
        store.getStore().set(key, val);
        ipcRendererStub.sendSync.should.not.be.called();
        writeFileSyncStub.should.be.calledOnce();
        writeFileSyncStub.firstCall.args[0].should.be.eql(
          `${PATH_TO_PREFERENCES}user-preferences.json`,
          { windowBounds: { width: 1200, height: 800 }, rtid: '', partnerId: '', someKey: 'some val' },
        );
      });
    });
  });
});
