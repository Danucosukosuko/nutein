const sinon = require('sinon');
const { importWithStubs } = require('../utils/importWithStubs');

describe('build/afterSign', () => {
  let afterSign;

  const existsSyncStub = sinon.stub();
  const joinStub = sinon.stub();
  const notarizeStub = sinon.stub();
  const getPasswordStub = sinon.stub();

  const params = {
    appOutDir: '/',
    packager: {
      appInfo: {
        productFilename: 'TuneIn',
      },
    },
  };

  const reset = () => {
    existsSyncStub.reset();
    existsSyncStub.returns(true);

    joinStub.reset();
    notarizeStub.reset();
    getPasswordStub.reset();
  };

  // Save original platform value to restore after each test
  const originalPlatform = process.platform;

  before(() => {
    afterSign = importWithStubs('/build/afterSign', {
      fs: {
        existsSync: existsSyncStub,
      },
      path: {
        join: joinStub,
      },
      'electron-notarize': {
        notarize: notarizeStub,
      },
      keychain: {
        getPassword: getPasswordStub,
      },
    });
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
    });
  });

  after(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  describe('on invocation', () => {
    before(async () => {
      reset();
      await afterSign(params);
    });

    it('existsSync should be called', () => {
      existsSyncStub.should.be.calledOnce();
    });

    it('getPassword should be called', () => {
      getPasswordStub.should.be.calledOnce()
        .calledWith({ account: 'osx-desktop@tunein.com', service: 'appleDesktop' });
    });
  });
});
