const sinon = require('sinon');
const forOwn = require('lodash/forOwn');
const { rewireWithStubs, resetRewire } = require('../utils/importWithStubs');
const { productName } = require('../../app/constants/general');
const events = require('../../app/constants/events');
const env = require('../../app/env.json');

describe('app/main', () => {
  let main;
  const appStub = {
    on: sinon.stub(),
    setName: sinon.stub(),
    getPath: sinon.stub(),
    isDefaultProtocolClient: sinon.stub(),
    setAsDefaultProtocolClient: sinon.stub(),
    requestSingleInstanceLock: sinon.stub(),
    quit: sinon.stub(),
  };
  const ipcMainStub = {
    on: sinon.stub(),
    once: sinon.stub(),
  };
  const menuInstanceStub = 'menuInstance';
  const menuStub = {
    initialize: sinon.stub(),
  };
  const storeStub = {
    get: sinon.stub().returns({ width: 1, height: 2 }),
    set: sinon.stub(),
  };
  const mainWindowStub = {
    on: sinon.stub(),
    once: sinon.stub(),
    show: sinon.stub(),
    hide: sinon.stub(),
    isMinimized: sinon.stub(),
    restore: sinon.stub(),
    focus: sinon.stub(),
    isFullScreen: sinon.stub().returns(true),
    setFullScreen: sinon.stub(),
    getBounds: sinon.stub().returns({ width: 1, height: 2 }),
    loadURL: sinon.stub(),
    webContents: {
      session: 'session',
    },
  };
  const updaterStub = sinon.stub({
    checkForUpdatesFromMenu: () => {},
    initialize: () => {},
    quitAndInstallUpdate: () => {},
  });
  const BrowserWindowStub = sinon.stub().returns(mainWindowStub);
  const setCustomUserAgentStub = sinon.stub();
  const registerKeyboardShortcutsStub = sinon.stub();
  const isMacEnvironmentStub = sinon.stub();
  const webContentsStub = {
    setMainWebContentsById: sinon.stub(),
    getMainWebContents: sinon.stub().returns(mainWindowStub.webContents),
  };
  const deepLinkEventHandlerStub = sinon.stub();
  const windowBoundsStub = { windowBounds: 'windowBounds' };
  const rendererStoreStub = { get: 'get', set: 'set' };
  const globalDirNameCache = __dirname;
  const openOauthStub = sinon.stub().returns('openOauthResult');
  const openTIGoogleAuthStub = sinon.stub();
  const parseUrlStub = sinon.stub();
  const initLoggerStub = sinon.stub();
  const getFbUrlsStub = sinon.stub();
  const openShareDialogStub = sinon.stub();
  const eventStub = { sender: 'geminiEventSender' };
  const menuHelperStub = sinon.stub({
    enablePlayPause: () => {},
    disableMenuHistory: () => {},
    enableMenuHistory: () => {},
    showOptOutPageMenuItem: () => {},
    hideOptOutPageMenuItem: () => {},
    showGdprSettingsMenuItem: () => {},
    hideGdprSettingsMenuItem: () => {},
  });
  const invokeWebContentsMethodStub = sinon.stub();

  const importStubs = {
    electron: {
      app: appStub,
      BrowserWindow: BrowserWindowStub,
      ipcMain: ipcMainStub,
    },
    'electron-is-dev': { default: false },
    './updater': updaterStub,
    './data/store': {
      getStore: sinon.stub().returns(storeStub),
    },
    './constants/store': windowBoundsStub,
    './constants/rendererStore': rendererStoreStub,
    './menu': menuStub,
    './utils/menuHelper': menuHelperStub,
    './utils/initCrashReporter': () => {},
    './utils/invokeWebContentsMethod': invokeWebContentsMethodStub,
    './utils/setCustomUserAgent': setCustomUserAgentStub,
    './registerShortcuts': registerKeyboardShortcutsStub,
    './utils/isMacEnvironment': isMacEnvironmentStub,
    './utils/webContents': webContentsStub,
    './oauth.js': { openOauth: openOauthStub },
    './utils/oauthUrlHelpers': { getFbUrls: getFbUrlsStub },
    './shareDialog': { openShareDialog: openShareDialogStub },
    './utils/deeplink/deepLinkEventHandler': deepLinkEventHandlerStub,
    './auth': { openTIGoogleAuth: openTIGoogleAuthStub },
    './utils/url': { parseUrl: parseUrlStub },
    './utils/logger': { initLogger: initLoggerStub },
  };

  const eventArgStub = {
    preventDefault: sinon.stub(),
  };

  function resetStubs() {
    appStub.isDefaultProtocolClient.reset();
    appStub.setAsDefaultProtocolClient.reset();
    Object.keys(mainWindowStub).forEach((key) => {
      if (typeof mainWindowStub[key] === 'function') {
        mainWindowStub[key].reset();
      }
    });
    parseUrlStub.reset();
    eventArgStub.preventDefault.reset();
  }

  function setupBefore() {
    // eslint-disable-next-line no-global-assign
    __dirname = __dirname.replace(/test\//, '');
    menuStub.initialize.withArgs(eventStub.sender).returns(menuInstanceStub);
    main = rewireWithStubs('/app/main', importStubs);
  }

  function cleanupAfter() {
    // eslint-disable-next-line no-global-assign
    __dirname = globalDirNameCache;
    resetRewire();
  }

  describe('electron app', () => {
    before(setupBefore);

    after(cleanupAfter);

    it('should set the app name on the app', () => {
      appStub.name.should.be.eql(productName);
    });

    it('should call app.on', () => {
      appStub.on.callCount.should.be.equal(6);
      appStub.on.firstCall.should.be.calledWith('certificate-error', main.onAppCertificateError);
      appStub.on.secondCall.should.be.calledWith('ready');
      appStub.on.thirdCall.should.be.calledWith('before-quit', main.quitHandler);
      appStub.on.getCall(3).should.be.calledWith('window-all-closed');
      appStub.on.getCall(4).should.be.calledWith('open-url', main.openUrlHandler);
      appStub.on.getCall(5).should.be.calledWith('second-instance', main.secondInstanceHandler);
    });

    describe('createAppWindow', () => {
      function resetStubHistory() {
        BrowserWindowStub.resetHistory();
        setCustomUserAgentStub.resetHistory();
        mainWindowStub.on.resetHistory();
        mainWindowStub.loadURL.resetHistory();
        registerKeyboardShortcutsStub.resetHistory();
        ipcMainStub.once.resetHistory();
        ipcMainStub.on.resetHistory();
        openOauthStub.resetHistory();
      }

      before(() => {
        isMacEnvironmentStub.returns(true);
        main.createAppWindow();
      });

      it('should call store.get() once with windowBounds', () => {
        storeStub.get.should.be.calledOnce().calledWithExactly(windowBoundsStub.windowBounds);
      });

      it('should call isMacEnvironment() once', () => {
        isMacEnvironmentStub.should.be.calledOnce();
      });

      it('should call ipcMain.on with correct args', () => {
        ipcMainStub.on.firstCall.args[0].should.be.eql(rendererStoreStub.get);
        ipcMainStub.on.firstCall.args[1].should.be.a.Function();
        ipcMainStub.on.secondCall.args[0].should.be.eql(rendererStoreStub.set);
        ipcMainStub.on.secondCall.args[1].should.be.a.Function();
      });

      describe('when isMac is false', () => {
        before(() => {
          resetStubHistory();
          isMacEnvironmentStub.returns(false);
          main.createAppWindow();
        });

        after(resetStubHistory);

        it('BrowserWindow() is called once with browserWindowOptions', () => {
          BrowserWindowStub.should.be.calledOnce().calledWithExactly({
            webPreferences: {
              enableRemoteModule: false,
              nodeIntegration: true,
              webviewTag: true,
              contextIsolation: false,
            },
            title: productName,
            devTools: false,
            width: 1,
            height: 2,
            minWidth: 415,
          });
        });

        it('setCustomUserAgent is called once with session', () => {
          setCustomUserAgentStub.should.be.calledOnce()
            .calledWithExactly(mainWindowStub.webContents.session);
        });

        it('mainWidow.on() is called once', () => {
          mainWindowStub.on.should.be.calledOnce();
        });
      });

      describe('when isMac is true', () => {
        before(() => {
          resetStubHistory();
          isMacEnvironmentStub.returns(true);
          main.createAppWindow();
        });

        it('BrowserWindow() is called once with browserWindowOptions', () => {
          BrowserWindowStub.should.be.calledOnce().calledWithExactly({
            webPreferences: {
              enableRemoteModule: false,
              nodeIntegration: true,
              webviewTag: true,
              contextIsolation: false,
            },
            title: productName,
            devTools: false,
            width: 1,
            height: 2,
            minWidth: 415,
            titleBarStyle: 'hiddenInset',
          });
        });

        it('setCustomUserAgent is called once with session', () => {
          setCustomUserAgentStub.should.be.calledOnce()
            .calledWithExactly(mainWindowStub.webContents.session);
        });

        it('mainWidow.on() is called twice', () => {
          mainWindowStub.on.should.be.calledTwice();
        });

        it('- called with `close` and function on first call', () => {
          mainWindowStub.on.should.be.calledWith('close');
          mainWindowStub.on.firstCall.args[1].should.be.a.Function();
        });

        describe('- when the first call listener is called', () => {
          let listenerEventStub;

          before(() => {
            listenerEventStub = { preventDefault: sinon.stub() };

            mainWindowStub.on.firstCall.args[1](listenerEventStub);
          });

          describe('when softClose is true', () => {
            describe('when mainWindow.isFullScreen() is true', () => {
              after(() => {
                mainWindowStub.hide.resetHistory();
              });

              it('mainWindow.once() is called once', () => {
                mainWindowStub.once.should.be.calledOnce();
              });

              it('- with `leave-full-screen` and a function', () => {
                mainWindowStub.once.firstCall.args[0].should.be.equal('leave-full-screen');
                mainWindowStub.once.firstCall.args[1].should.be.a.Function();
              });

              it('- mainWindow.hide() is called when the listener is called', () => {
                mainWindowStub.once.firstCall.args[1]();
                mainWindowStub.hide.should.be.calledOnce();
              });

              it('mainWindow.setFullScreen() is called once with false', () => {
                mainWindowStub.setFullScreen.should.be.calledOnce().calledWithExactly(false);
              });

              it('event.preventDefault() should be called once', () => {
                listenerEventStub.preventDefault.should.be.calledOnce();
              });
            });

            describe('when mainWindow.isFullScreen() is false', () => {
              before(() => {
                mainWindowStub.isFullScreen.returns(false);
                main.createAppWindow();
                mainWindowStub.on.firstCall.args[1](listenerEventStub);
              });

              it('mainWindow.hide() is called once', () => {
                mainWindowStub.hide.should.be.calledOnce();
              });
            });
          });

          // TODO: Write tests when source file is restructured for complete stubbing
          // describe('when softClose is false', () => {
          //
          // });
        });
      });

      it('- called with `resize` and function on second call', () => {
        mainWindowStub.on.should.be.calledWith('resize');
        mainWindowStub.on.secondCall.args[1].should.be.a.Function();
      });

      describe('- when the second call listener is called', () => {
        before(() => {
          mainWindowStub.getBounds.resetHistory();
          mainWindowStub.on.secondCall.args[1]();
        });

        after(() => {
          ipcMainStub.on.reset();
        });

        it('mainWindow.getBounds() is called once', () => {
          mainWindowStub.getBounds.should.be.calledOnce();
        });

        it('store.set() should be called once with windowBounds and width/height object', () => {
          storeStub.set.should.be.calledOnce().calledWithExactly(
            windowBoundsStub.windowBounds,
            {
              width: 1,
              height: 2,
            },
          );
        });
      });

      it('mainWindow.loadURL should be called once with file path', () => {
        mainWindowStub.loadURL.should.be.calledOnce().calledWithExactly(`file://${__dirname}/index.html`);
      });

      it('registerKeyboardShortcuts() should be called once', () => {
        registerKeyboardShortcutsStub.should.be.calledOnce();
      });

      it('ipcMain.once() should be called twice', () => {
        ipcMainStub.once.should.be.calledTwice();
      });

      it('- called with events.setUpLocalizations and setUpLocalizations on first call', () => {
        ipcMainStub.once.firstCall.args.should.be.eql([
          events.setUpLocalizations,
          main.setUpLocalizations,
        ]);
      });

      it('- called with events.setUpGeminiEventSender and onGeminiInitialization on second call', () => {
        ipcMainStub.once.secondCall.args.should.be.eql([
          events.setUpGeminiEventSender,
          main.onGeminiInitialization,
        ]);
      });

      it('openOauth() should be called once', () => {
        openOauthStub.should.be.calledOnce();
      });

      it('- called with mainWindow, getFbUrls, and events.fbAuthenticated', () => {
        openOauthStub.should.be.calledWithExactly(
          mainWindowStub,
          getFbUrlsStub,
          events.fbAuthenticated,
        );
      });

      it('ipcMain.on() should be called 8 times', () => {
        ipcMainStub.on.callCount.should.be.eql(8);
      });

      it('- called with events.fbAuthenticate and openOauth result on first call', () => {
        ipcMainStub.on.calledWith(
          events.fbAuthenticate,
          'openOauthResult',
        ).should.be.true();
      });

      it('- called with events.openShareDialog and openShareDialog on second call', () => {
        ipcMainStub.on.calledWith(
          events.openShareDialog,
          openShareDialogStub,
        ).should.be.true();
      });

      it('- called with events.openAuth and openAuth on the third call', () => {
        ipcMainStub.on.calledWith(
          events.openGoogleAuth,
          openTIGoogleAuthStub,
        ).should.be.true();
      });

      it('- called with events.setMainWebContents', () => {
        ipcMainStub.on.calledWith(events.setMainWebContents).should.be.true();
      });
    });

    describe('onGeminiInitialization', () => {
      let localizations;
      let quitHandler;
      let revertMainWindow;
      let revertLocalizations;
      let revertQuitHandler;

      before(() => {
        mainWindowStub.on.reset();

        localizations = 'localizations';
        quitHandler = 'quitHandler';

        revertMainWindow = main.__set__('mainWindow', mainWindowStub);
        revertLocalizations = main.__set__('localizations', localizations);
        revertQuitHandler = main.__set__('quitHandler', quitHandler);

        main.onGeminiInitialization(eventStub);
      });

      after(() => {
        forOwn(menuHelperStub, stub => stub.reset());
        menuStub.initialize.resetHistory();
        updaterStub.initialize.reset();
        updaterStub.quitAndInstallUpdate.reset();
        ipcMainStub.on.reset();
        mainWindowStub.on.reset();
        invokeWebContentsMethodStub.reset();

        revertMainWindow();
        revertLocalizations();
        revertQuitHandler();
        menuStub.initialize.reset();
      });

      it('calls menu.initialize() with expected args', () => {
        menuStub.initialize.should.be.calledOnce()
          .calledWithExactly(eventStub.sender, localizations);
      });

      describe('ipcMain.on()', () => {
        it('should be called 7 times', () => {
          ipcMainStub.on.callCount.should.be.equal(7);
        });

        describe('- on first call', () => {
          let args;

          before(() => {
            args = ipcMainStub.on.args[0];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql(events.enableMenuPlayPause);
          });

          it('calls enablePlayPause() with expected args when second arg is invoked', () => {
            args[1]();
            menuHelperStub.enablePlayPause.should.be.calledOnce()
              .calledWithExactly(menuInstanceStub);
          });
        });

        describe('- on second call', () => {
          let args;

          before(() => {
            args = ipcMainStub.on.args[1];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql(events.showOptOutPageMenuItem);
          });

          it('calls showOptOutPageMenuItem() with expected args when second arg is invoked', () => {
            args[1]();
            menuHelperStub.showOptOutPageMenuItem.should.be.calledOnce()
              .calledWithExactly(menuInstanceStub);
          });
        });

        describe('- on third call', () => {
          let args;

          before(() => {
            args = ipcMainStub.on.args[2];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql(events.hideOptOutPageMenuItem);
          });

          it('calls hideOptOutPageMenuItem() with expected args when second arg is invoked', () => {
            args[1]();
            menuHelperStub.hideOptOutPageMenuItem.should.be.calledOnce()
              .calledWithExactly(menuInstanceStub);
          });
        });

        describe('- on fourth call', () => {
          let args;

          before(() => {
            args = ipcMainStub.on.args[3];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql(events.showGdprSettingsMenuItem);
          });

          it('calls showGdprSettingsMenuItem() with expected args when second arg is invoked', () => {
            args[1]();
            menuHelperStub.showGdprSettingsMenuItem.should.be.calledOnce()
              .calledWithExactly(menuInstanceStub);
          });
        });

        describe('- on fifth call', () => {
          let args;

          before(() => {
            args = ipcMainStub.on.args[4];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql(events.hideGdprSettingsMenuItem);
          });

          it('calls hideGdprSettingsMenuItem() with expected args when second arg is invoked', () => {
            args[1]();
            menuHelperStub.hideGdprSettingsMenuItem.should.be.calledOnce()
              .calledWithExactly(menuInstanceStub);
          });
        });

        describe('- on sixth call', () => {
          let args;

          before(() => {
            args = ipcMainStub.on.args[5];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql(events.reloadPage);
          });

          it('calls invokeWebContentsMethod() with expected args when second arg is invoked', () => {
            args[1]();
            invokeWebContentsMethodStub.should.be.calledOnce().calledWithExactly('reload');
          });
        });

        describe('- on seventh call', () => {
          let args;

          before(() => {
            args = ipcMainStub.on.args[6];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql(events.quitDesktopAndInstallUpdate);
          });

          it('calls updater.quitAndInstallUpdate() when second arg is invoked', () => {
            args[1]();
            updaterStub.quitAndInstallUpdate.should.be.calledOnce();
          });
        });
      });

      describe('mainWindow.on()', () => {
        it('should be called twice', () => {
          mainWindowStub.on.should.be.calledTwice();
        });

        describe('- on first call', () => {
          let args;

          before(() => {
            args = mainWindowStub.on.args[0];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql('minimize');
          });

          it('calls disableMenuHistory() with expected args when second arg is invoked', () => {
            args[1]();
            menuHelperStub.disableMenuHistory.should.be.calledOnce()
              .calledWithExactly(menuInstanceStub);
          });
        });

        describe('- on second call', () => {
          let args;

          before(() => {
            args = mainWindowStub.on.args[1];
          });

          it('is passed in the expected first arg', () => {
            args[0].should.be.eql('restore');
          });

          it('calls enableMenuHistory() with expected args when second arg is invoked', () => {
            args[1]();
            menuHelperStub.enableMenuHistory.should.be.calledOnce()
              .calledWithExactly(menuInstanceStub);
          });
        });
      });

      it('calls updater.initialize() with expected args', () => {
        updaterStub.initialize.should.be.calledOnce()
          .calledWithExactly(quitHandler, eventStub.sender, menuInstanceStub, localizations);
      });
    });
  });

  describe('onReady', () => {
    describe('when app.isDefaultProtocolClient returns false', () => {
      before(() => {
        resetStubs();
        setupBefore();
        appStub.isDefaultProtocolClient.returns(false);
        appStub.on.secondCall.args[1]();
      });

      after(cleanupAfter);

      it('calls isDefaultProtocolClient', () => {
        appStub.isDefaultProtocolClient.should.be.calledOnce().calledWithExactly('tunein');
      });

      it('calls setAsDefaultProtocolClient', () => {
        appStub.setAsDefaultProtocolClient.should.be.calledOnce().calledWithExactly('tunein');
      });
    });

    describe('when app.isDefaultProtocolClient returns true', () => {
      before(() => {
        resetStubs();
        appStub.isDefaultProtocolClient.returns(true);
        setupBefore();
        appStub.on.secondCall.args[1]();
      });

      it('calls isDefaultProtocolClient', () => {
        appStub.isDefaultProtocolClient.should.be.calledOnce().calledWithExactly('tunein');
      });

      it('does not call setAsDefaultProtocolClient', () => {
        appStub.setAsDefaultProtocolClient.should.not.be.called();
      });
    });
  });

  describe('onAppCertificateError', () => {
    let callbackStub;
    const arg = '';
    const url = `https://${env.url}`;

    before(() => {
      setupBefore();
      resetStubs();
      callbackStub = sinon.stub();
    });

    after(cleanupAfter);

    describe(`when url starts with '${url}'`, () => {
      before(() => {
        resetStubs();
        main.onAppCertificateError(eventArgStub, arg, url, arg, arg, callbackStub);
      });

      after(() => {
        callbackStub.resetHistory();
      });

      it('event.preventDefault() should be called once', () => {
        eventArgStub.preventDefault.should.be.calledOnce();
      });

      it('callback should be called once with true', () => {
        callbackStub.should.be.calledOnce().calledWithExactly(true);
      });
    });

    describe(`when url does NOT start with '${url}'`, () => {
      before(() => {
        resetStubs();
        main.onAppCertificateError(eventArgStub, arg, arg, arg, arg, callbackStub);
      });

      it('event.preventDefault() should NOT be called', () => {
        eventArgStub.preventDefault.should.not.be.called();
      });

      it('callback should be called once with false', () => {
        callbackStub.should.be.calledOnce().calledWithExactly(false);
      });
    });
  });

  describe('openUrlHandler', () => {
    const url = `https://${env.url}`;

    before(() => {
      setupBefore();
    });

    after(cleanupAfter);

    describe('when called', () => {
      const parsedValue = 'some value';

      before(() => {
        resetStubs();
        parseUrlStub.returns(parsedValue);
        main.openUrlHandler(eventArgStub, url);
      });

      it('event.preventDefault() should be called once', () => {
        eventArgStub.preventDefault.should.be.calledOnce();
      });

      it('calls nodeUrl.parse with correct args', () => {
        parseUrlStub.should.be.calledOnce().calledWithExactly(url, true);
      });

      it('calls deepLinkEventHandler with correct args', () => {
        deepLinkEventHandlerStub.should.be.calledOnce().calledWithExactly(parsedValue);
      });
    });
  });

  describe('secondInstanceHandler', () => {
    const url = `tunein://${env.url}`;

    before(() => {
      setupBefore();
      main.createAppWindow();
    });

    after(() => {
      cleanupAfter();
    });

    describe('when called', () => {
      describe('and window is minimized', () => {
        before(() => {
          resetStubs();
          mainWindowStub.isMinimized.returns(true);
          main.secondInstanceHandler(eventArgStub, ['smth', url]);
        });

        it('calls restore on the main window', () => {
          mainWindowStub.restore.should.be.calledOnce();
        });

        it('calls focus on the main window', () => {
          mainWindowStub.focus.should.be.calledOnce().calledWithExactly({
            steal: true,
          });
        });
      });

      describe('and window is NOT minimized', () => {
        before(() => {
          resetStubs();
          mainWindowStub.isMinimized.returns(false);
          main.secondInstanceHandler(eventArgStub, ['smth', url]);
        });

        it('calls restore on the main window', () => {
          mainWindowStub.restore.should.not.be.called();
        });

        it('calls focus on the main window', () => {
          mainWindowStub.focus.should.be.calledOnce().calledWithExactly({
            steal: true,
          });
        });
      });

      describe('when process.platform = win32', () => {
        let originalPlatform;

        before(() => {
          originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
          Object.defineProperty(process, 'platform', {
            value: 'win32',
          });
          resetStubs();
          mainWindowStub.isMinimized.returns(false);
          main.secondInstanceHandler(eventArgStub, ['smth', url]);
        });

        after(() => {
          Object.defineProperty(process, 'platform', originalPlatform);
        });

        it('calls event preventDefault inside openUrlHandler', () => {
          eventArgStub.preventDefault.should.be.calledOnce();
        });

        it('calls node.parse with correct args inside openUrlHandler', () => {
          parseUrlStub.should.be.calledOnce().calledWithExactly(url, true);
        });
      });

      describe('when process.platform = some other value', () => {
        let originalPlatform;

        before(() => {
          originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
          Object.defineProperty(process, 'platform', {
            value: 'something else',
          });
          resetStubs();
          mainWindowStub.isMinimized.returns(false);
          main.secondInstanceHandler(eventArgStub, ['smth', url]);
        });

        after(() => {
          Object.defineProperty(process, 'platform', originalPlatform);
        });

        it('does not call event preventDefault inside openUrlHandler', () => {
          eventArgStub.preventDefault.should.not.be.called();
        });

        it('does not call node.parse with correct args inside openUrlHandler', () => {
          parseUrlStub.should.not.be.called();
        });
      });
    });
  });

  // TODO: Write tests when source file is restructured for complete stubbing
  // describe('onAppActivation', () => {
  //   describe('when mainWindow is NOT null', () => {
  //     before(() => {
  //       main.onAppActivation();
  //     });
  //
  //     it('mainWindow.show() should be called once', () => {
  //       mainWindowStub.show.should.be.calledOnce();
  //     });
  //   });
  //
  //   describe('when mainWindow is null', () => {
  //     before(() => {
  //       main.onAppActivation();
  //     });
  //
  //     it('createAppWindow() should be called once', () => {
  //       main.createAppWindow.should.be.calledOnce();
  //     });
  //   });
  // });
});
