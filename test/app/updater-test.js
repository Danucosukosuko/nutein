const sinon = require('sinon');
const transform = require('lodash/transform');
const { importWithStubs } = require('../utils/importWithStubs');
const events = require('../../app/constants/events');
const localizations = require('../../app/constants/localizations');

const mappedLocalizations = transform(localizations, (o, v) => { o[v] = v; });

const path = '/app/updater';

describe(path, () => {
  let updaterMethods;

  const appStub = {
    isInApplicationsFolder: sinon.stub().returns(true),
  };
  const dialogStub = {
    showMessageBox: sinon.stub(),
  };
  const autoUpdaterStub = {
    quitAndInstall: sinon.stub(),
    downloadUpdate: sinon.stub(),
    checkForUpdates: sinon.stub(),
    on: sinon.stub(),
  };
  const logStub = {
    warn: sinon.stub(),
  };
  const formatClientErrorReturnValue = 'formatClientErrorReturnValue';
  const formatClientErrorStub = sinon.stub().returns(formatClientErrorReturnValue);
  const sendAppEventStub = sinon.stub();
  const menuHelperStub = {
    enableMenuCheckForUpdates: sinon.stub(),
    disableMenuCheckForUpdates: sinon.stub(),
  };
  const quitHandlerStub = sinon.stub();
  const geminiEventSenderStub = {
    send: sinon.stub(),
  };
  const menuInstanceStub = 'menuInstance';
  const globalSetIntervalCache = global.setInterval;

  before(() => {
    global.setInterval = sinon.stub();

    updaterMethods = importWithStubs(path, {
      electron: { app: appStub, dialog: dialogStub },
      'electron-updater': { autoUpdater: autoUpdaterStub },
      'electron-log': logStub,
      'electron-is-dev': { default: false },
      './utils/formatClientError': formatClientErrorStub,
      './utils/sendAppEvent': sendAppEventStub,
      './utils/menuHelper': menuHelperStub,
      './utils/isMacEnvironment': true,
    });

    updaterMethods
      .initialize(quitHandlerStub, geminiEventSenderStub, menuInstanceStub, mappedLocalizations);
  });

  after(() => {
    global.setInterval = globalSetIntervalCache;
  });

  describe('initAutoUpdater (initialize)', () => {
    after(() => {
      menuHelperStub.disableMenuCheckForUpdates.reset();
      autoUpdaterStub.checkForUpdates.reset();
    });

    it('autoUpdater.on() should be called 4 times', () => {
      autoUpdaterStub.on.callCount.should.be.eql(4);
    });

    it('- first call has expected args', () => {
      autoUpdaterStub.on.getCall(0).should.be.calledWithExactly('update-available', updaterMethods.onUpdateAvailable);
    });

    it('- second call has expected args', () => {
      autoUpdaterStub.on.getCall(1).should.be.calledWithExactly('update-not-available', updaterMethods.onUpdateNotAvailable);
    });

    it('- third call has expected args', () => {
      autoUpdaterStub.on.getCall(2).should.be.calledWithExactly('update-downloaded', updaterMethods.onUpdateDownloaded);
    });

    it('- fourth call has expected args', () => {
      autoUpdaterStub.on.getCall(3).should.be.calledWithExactly('error', updaterMethods.onError);
    });

    it('checkForUpdates() should be called once', () => {
      autoUpdaterStub.checkForUpdates.should.be.calledOnce();
    });

    it('setInterval() should be called once', () => {
      global.setInterval.should.be.calledOnce();
    });

    it('- setInterval function calls checkForUpdates once', () => {
      autoUpdaterStub.checkForUpdates.reset();
      global.setInterval.args[0][0]();
      autoUpdaterStub.checkForUpdates.should.be.calledOnce();
    });

    it('- with timeout set to one day in milliseconds', () => {
      global.setInterval.args[0][1].should.be.eql(24 * 60 * 60 * 1000);
    });
  });

  describe('quitAndInstallUpdate', () => {
    before(() => {
      updaterMethods.quitAndInstallUpdate();
    });

    after(() => {
      autoUpdaterStub.quitAndInstall.reset();
    });

    it('quitHandler should be called once', () => {
      quitHandlerStub.should.be.calledOnce();
    });

    it('quitAndInstall should be called once', () => {
      autoUpdaterStub.quitAndInstall.should.be.calledOnce();
    });

    it('- with isSilent and isForceRunAfter set to true', () => {
      autoUpdaterStub.quitAndInstall.args[0].should.eql([true, true]);
    });
  });

  describe('onDownloadUpdateSuccess', () => {
    before(async () => {
      dialogStub.showMessageBox.resolves();
      await updaterMethods.onDownloadUpdateSuccess();
    });

    after(() => {
      dialogStub.showMessageBox.reset();
      autoUpdaterStub.quitAndInstall.reset();
    });

    it('dialog.showMessageBox() should be called once', () => {
      dialogStub.showMessageBox.should.be.calledOnce();
    });

    it('- with the expected args', () => {
      dialogStub.showMessageBox.args[0].should.eql([
        {
          title: localizations.updateDownloadSuccessTitleKey,
          message: localizations.updateDownloadSuccessMessageKey,
          buttons: [localizations.okKey],
        },
      ]);
    });

    it('- with isSilent and isForceRunAfter set to true', () => {
      autoUpdaterStub.quitAndInstall.args[0].should.eql([true, true]);
    });
  });

  describe('onDownloadUpdateFail', () => {
    const errorArg = 'errorArg';

    before(async () => {
      dialogStub.showMessageBox.resolves();
      await updaterMethods.onDownloadUpdateFail(errorArg);
    });

    after(() => {
      dialogStub.showMessageBox.reset();
      geminiEventSenderStub.send.reset();
      formatClientErrorStub.resetHistory();
      menuHelperStub.enableMenuCheckForUpdates.reset();
    });

    it('geminiEventSender.send() should be called once', () => {
      geminiEventSenderStub.send.should.be.calledOnce();
    });

    it('- with a logClientError event and formatted client error value', () => {
      geminiEventSenderStub.send.args[0].should.eql([
        events.logClientError,
        formatClientErrorReturnValue,
      ]);
    });

    it('formatClientError should be called once', () => {
      formatClientErrorStub.should.be.calledOnce();
    });

    it('- with the expected message and error object', () => {
      formatClientErrorStub.args[0][0].should.eql({
        message: 'updater.js | onDownloadUpdateFail',
        error: errorArg,
      });
    });

    it('dialog.showMessageBox() should be called once', () => {
      dialogStub.showMessageBox.should.be.calledOnce();
    });

    it('- with the expected args', () => {
      dialogStub.showMessageBox.args[0][0].should.eql({
        title: localizations.errorKey,
        message: localizations.updateDownloadFailMessageKey,
        buttons: [localizations.okKey],
      });
    });

    it('enableMenuCheckForUpdates() should be called once with menuInstance', () => {
      menuHelperStub.enableMenuCheckForUpdates.should.be.calledOnce()
        .calledWithExactly(menuInstanceStub);
    });
  });

  describe('onConfirmUpdate', () => {
    describe('when dialogResult.response is 0', () => {
      before(async () => {
        autoUpdaterStub.downloadUpdate.resolves();
        dialogStub.showMessageBox.resolves();
        await updaterMethods.onConfirmUpdate({ response: 0 });
      });

      after(() => {
        dialogStub.showMessageBox.reset();
        autoUpdaterStub.downloadUpdate.reset();
        autoUpdaterStub.quitAndInstall.reset();
        menuHelperStub.enableMenuCheckForUpdates.reset();
      });

      it('autoUpdater.downloadUpdate() should be called once', () => {
        autoUpdaterStub.downloadUpdate.should.be.calledOnce();
      });

      it('dialog.showMessageBox() should be called once', () => {
        dialogStub.showMessageBox.should.be.calledOnce();
      });

      it('enableMenuCheckForUpdates() should be NOT be called', () => {
        menuHelperStub.enableMenuCheckForUpdates.should.not.be.called();
      });
    });

    describe('when dialogResult.response is 1', () => {
      before(async () => {
        await updaterMethods.onConfirmUpdate({ response: 1 });
      });

      after(() => {
        menuHelperStub.enableMenuCheckForUpdates.reset();
      });

      it('enableMenuCheckForUpdates() should be called once with menuInstance', () => {
        menuHelperStub.enableMenuCheckForUpdates.should.be.calledOnce()
          .calledWithExactly(menuInstanceStub);
      });
    });
  });

  describe('onUpdateAvailable', () => {
    describe('when updateTriggeredViaMenu is false', () => {
      before(async () => {
        await updaterMethods.onUpdateAvailable();
      });

      it('dialog.showMessageBox() should NOT be called', () => {
        autoUpdaterStub.downloadUpdate.should.not.be.called();
      });
    });
  });

  describe('onUpdateNotAvailable', () => {
    describe('when updateTriggeredViaMenu is false', () => {
      before(async () => {
        await updaterMethods.onUpdateNotAvailable();
      });

      after(() => {
        menuHelperStub.enableMenuCheckForUpdates.reset();
      });

      it('dialog.showMessageBox() should NOT be called', () => {
        autoUpdaterStub.downloadUpdate.should.not.be.called();
      });

      it('enableMenuCheckForUpdates() should be called once with menuInstance', () => {
        menuHelperStub.enableMenuCheckForUpdates.should.be.calledOnce()
          .calledWithExactly(menuInstanceStub);
      });
    });
  });

  describe('onUpdateDownloaded', () => {
    describe('when updateTriggeredViaMenu is false', () => {
      before(() => {
        updaterMethods.onUpdateDownloaded();
      });

      after(() => {
        menuHelperStub.enableMenuCheckForUpdates.reset();
      });

      it('sendAppEvent() should be called once with activateDesktopUpdateBanner event', () => {
        sendAppEventStub.should.be.calledOnce()
          .calledWithExactly(events.activateDesktopUpdateBanner);
      });

      it('enableMenuCheckForUpdates() should be called once with menuInstance', () => {
        menuHelperStub.enableMenuCheckForUpdates.should.be.calledOnce()
          .calledWithExactly(menuInstanceStub);
      });
    });
  });

  describe('onError', () => {
    const errorArg = {
      message: 'errorArg',
    };

    describe('when error arg is truthy', () => {
      before(() => {
        geminiEventSenderStub.send.reset();
        updaterMethods.onError(errorArg);
      });

      after(() => {
        geminiEventSenderStub.send.reset();
        dialogStub.showMessageBox.reset();
        formatClientErrorStub.resetHistory();
        menuHelperStub.enableMenuCheckForUpdates.reset();
      });

      it('geminiEventSender.send() should be called once', () => {
        geminiEventSenderStub.send.should.be.calledOnce();
      });

      it('- with a logClientError event and formatted client error value', () => {
        geminiEventSenderStub.send.args[0].should.eql([
          events.logClientError,
          formatClientErrorReturnValue,
        ]);
      });

      it('formatClientError should be called once', () => {
        formatClientErrorStub.should.be.calledOnce();
      });

      it('- with the expected message and error object', () => {
        formatClientErrorStub.args[0][0].should.eql({
          message: 'updater.js | onError',
          error: errorArg,
        });
      });

      describe('when updateTriggeredViaMenu is false', () => {
        it('dialog.showMessageBox() should NOT be called', () => {
          dialogStub.showMessageBox.should.not.be.called();
        });
      });

      it('enableMenuCheckForUpdates() should be called once with menuInstance', () => {
        menuHelperStub.enableMenuCheckForUpdates.should.be.calledOnce()
          .calledWithExactly(menuInstanceStub);
      });
    });

    describe('when error arg is truthy and isInApplicationsFolder returns false', () => {
      before(() => {
        geminiEventSenderStub.send.reset();
        appStub.isInApplicationsFolder.returns(false);
        updaterMethods.onError(errorArg);
      });

      after(() => {
        geminiEventSenderStub.send.reset();
        appStub.isInApplicationsFolder.returns(true);
        dialogStub.showMessageBox.reset();
        formatClientErrorStub.resetHistory();
        menuHelperStub.enableMenuCheckForUpdates.reset();
      });

      it('geminiEventSender.send() should not be called', () => {
        geminiEventSenderStub.send.should.not.be.called();
      });

      it('formatClientError should not be called', () => {
        formatClientErrorStub.should.not.be.called();
      });

      it('dialog.showMessageBox() should NOT be called', () => {
        dialogStub.showMessageBox.should.not.be.called();
      });

      it('enableMenuCheckForUpdates() should be called once with menuInstance', () => {
        menuHelperStub.enableMenuCheckForUpdates.should.be.calledOnce()
          .calledWithExactly(menuInstanceStub);
      });
    });

    describe('when error arg is falsy', () => {
      before(() => {
        geminiEventSenderStub.send.reset();
        updaterMethods.onError();
      });

      after(() => {
        dialogStub.showMessageBox.reset();
      });

      it('geminiEventSender.send() should be NOT called', () => {
        geminiEventSenderStub.send.should.not.be.called();
      });

      it('formatClientError should NOT be called', () => {
        formatClientErrorStub.should.not.be.called();
      });

      it('enableMenuCheckForUpdates() should be called once with menuInstance', () => {
        menuHelperStub.enableMenuCheckForUpdates.should.be.calledOnce()
          .calledWithExactly(menuInstanceStub);
      });

      describe('when updateTriggeredViaMenu is false', () => {
        it('dialog.showMessageBox() should NOT be called', () => {
          dialogStub.showMessageBox.should.not.be.called();
        });
      });
    });
  });

  describe('checkForUpdates', () => {
    before(() => {
      menuHelperStub.disableMenuCheckForUpdates.reset();
      autoUpdaterStub.checkForUpdates.reset();
      updaterMethods.checkForUpdates();
    });

    after(() => {
      menuHelperStub.disableMenuCheckForUpdates.reset();
      autoUpdaterStub.checkForUpdates.reset();
    });

    it('disableMenuCheckForUpdates() should be called once with menuInstance', () => {
      menuHelperStub.disableMenuCheckForUpdates.should.be.calledOnce()
        .calledWithExactly(menuInstanceStub);
    });

    it('autoUpdater.checkForUpdates() should be called once', () => {
      autoUpdaterStub.checkForUpdates.should.be.calledOnce();
    });
  });

  describe('checkForUpdatesFromMenu', () => {
    before(() => {
      updaterMethods.checkForUpdatesFromMenu();
    });

    after(() => {
      autoUpdaterStub.checkForUpdates.reset();
    });

    it('autoUpdater.checkForUpdates() should be called once', () => {
      autoUpdaterStub.checkForUpdates.should.be.calledOnce();
    });
  });
});
