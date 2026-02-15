const sinon = require('sinon');
const { importWithStubs } = require('../../utils/importWithStubs');
const { productName } = require('../../../app/constants/general');
const packageJson = require('../../../package.json');

const version = packageJson.version;

describe('app/utils/initCrashReporter', () => {
  let initCrashReporter;

  let importWithEnvironment;
  const startCrashReporterStub = sinon.stub();
  const storeGetStub = sinon.stub().withArgs('rtid').returns('some-rtid');

  const reset = () => {
    startCrashReporterStub.reset();
  };

  before(() => {
    importWithEnvironment = (url) => {
      initCrashReporter = importWithStubs('/app/utils/initCrashReporter', {
        '../../package.json': {
          version
        },
        electron: {
          crashReporter: {
            start: startCrashReporterStub,
          },
        },
        '../env.json': {
          url,
        },
        '../data/store': {
          getStore: () => ({
            get: storeGetStub,
          }),
        },
        '../utils/isMacEnvironment': () => true,
      });
    };
  });

  describe('when initCrashReporter is invoked locally', () => {
    before(() => {
      reset();
      importWithEnvironment('localhost');
      initCrashReporter();
    });

    it('crashReporter.start should be called with correct params for localhost', () => {
      startCrashReporterStub.should.be.calledOnce()
        .calledWithExactly({
          compress: true,
          productName: `${productName} MacOS`,
          submitURL: 'http://127.0.0.1:3000/api/v1/desktop/logCrashReport',
          extra: {
            rtid: 'some-rtid',
            tuneInAppVersion: version,
          },
          companyName: productName,
          globalExtra: { _companyName: productName },
        });
    });
  });

  describe('when initCrashReporter is invoked in another environment', () => {
    before(() => {
      reset();
      importWithEnvironment('dev.tunein.com');
      initCrashReporter();
    });

    it('crashReporter.start should be called with correct params for that env url', () => {
      startCrashReporterStub.should.be.calledOnce()
        .calledWithExactly({
          compress: true,
          productName: `${productName} MacOS`,
          submitURL: 'https://dev.tunein.com/api/v1/desktop/logCrashReport',
          extra: {
            rtid: 'some-rtid',
            tuneInAppVersion: version,
          },
          companyName: productName,
          globalExtra: { _companyName: productName },
        });
    });
  });

});
