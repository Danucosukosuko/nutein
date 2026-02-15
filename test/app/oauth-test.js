const sinon = require('sinon');
const { importWithStubs } = require('../utils/importWithStubs');

const facebookRedirectUri = 'https://www.facebook.com/connect/login_success.html';
const redirectUrlWithAccessToken = `${facebookRedirectUri}#access_token=`;

const path = '/app/oauth.js';

describe(path, () => {
  let oauthMethods;
  let BrowserWindowStub;
  let throttleStub;

  before(() => {
    BrowserWindowStub = sinon.stub();
    throttleStub = sinon.spy(fn => fn);

    const imports = importWithStubs(path, {
      electron: { BrowserWindow: BrowserWindowStub },
      'lodash/throttle': throttleStub,
    });

    oauthMethods = imports.oauthMethods;
  });

  describe('getAccessToken(url)', () => {
    it('access token is extracted from url', () => {
      const testUrl = `${facebookRedirectUri}#access_token=123&expires=sometime`;
      oauthMethods.getAccessToken(testUrl, redirectUrlWithAccessToken).should.eql('123');
    });

    it('access token is extracted from url with no expiration', () => {
      const testUrl = `${facebookRedirectUri}#access_token=abc`;
      oauthMethods.getAccessToken(testUrl, redirectUrlWithAccessToken).should.eql('abc');
    });
  });

  describe('oauthResponseHandler()', () => {
    let url;
    let callback;

    before(() => {
      sinon.spy(oauthMethods, 'getAccessToken');
      callback = sinon.stub();
    });

    describe('when url includes ACCESS_TOKEN_PARAM', () => {
      before(() => {
        oauthMethods.getAccessToken.resetHistory();
      });

      describe('when accessToken value exists', () => {
        before(() => {
          url = 'https://tunein.com/?access_token=123';
          oauthMethods.oauthResponseHandler(callback, { url });
        });

        after(() => {
          oauthMethods.getAccessToken.resetHistory();
          callback.resetHistory();
        });

        it('calls getAccessToken() once with url', () => {
          oauthMethods.getAccessToken.should.be.calledOnce().calledWithExactly(url);
        });

        it('calls callback once with accessToken', () => {
          callback.should.be.calledOnce().calledWithExactly('123');
        });
      });

      describe('when accessToken value does NOT exist', () => {
        before(() => {
          url = 'https://tunein.com/?access_token=';
          oauthMethods.oauthResponseHandler(callback, { url });
        });

        it('calls getAccessToken() once with url', () => {
          oauthMethods.getAccessToken.should.be.calledOnce().calledWithExactly(url);
        });

        it('does NOT call callback', () => {
          callback.should.not.be.called();
        });
      });
    });

    describe('when url does NOT include ACCESS_TOKEN_PARAM', () => {
      before(() => {
        oauthMethods.getAccessToken.resetHistory();
      });

      describe('when url contains ACCESS_DENIED_PARAM', () => {
        before(() => {
          url = 'https://tunein.com/?error=access_denied';
          oauthMethods.oauthResponseHandler(callback, { url });
        });

        after(() => {
          callback.resetHistory();
        });

        it('does NOT call getAccessToken()', () => {
          oauthMethods.getAccessToken.should.not.be.called();
        });

        it('calls callback once without any args', () => {
          callback.should.be.calledOnce().calledWithExactly();
        });
      });

      describe('when url does NOT contain ACCESS_DENIED_PARAM', () => {
        before(() => {
          url = 'https://tunoein.com/';
          oauthMethods.oauthResponseHandler(callback, { url });
        });

        it('does NOT call getAccessToken()', () => {
          oauthMethods.getAccessToken.should.not.be.called();
        });

        it('calls callback once without any args', () => {
          callback.should.not.be.called();
        });
      });
    });
  });

  describe('urlCompleteHandler()', () => {
    let redirectUriStub;
    let callbackStub;

    before(() => {
      redirectUriStub = 'bomb.com';
      callbackStub = () => {};
    });

    it('sets filter property and returns a listener', () => {
      const listener = oauthMethods.urlCompleteHandler(redirectUriStub, callbackStub);

      oauthMethods.filter.should.eql({ urls: [redirectUriStub] });
      listener.should.eql(
        oauthMethods.oauthResponseHandler.bind(oauthMethods, callbackStub),
      );
    });
  });

  describe('openOauth()', () => {
    let mainWindowStub;
    let urlsStub;
    let getOauthUrlsStub;
    let completionEventStub;
    let eventStub;
    let configStub;
    let authWindowStub;
    let returnedFn;
    let originalUrlCompleteHandler;
    let urlCompleteHandlerResultStub;

    before(() => {
      urlsStub = {
        authUrl: 'authUrl',
        redirectUri: 'redirectUri',
        filterUri: 'filterUri',
      };
      getOauthUrlsStub = sinon.stub().returns(urlsStub);
      completionEventStub = {};
      eventStub = {
        sender: {
          send: sinon.stub(),
        },
      };
      configStub = {};
      mainWindowStub = {
        once: sinon.stub(),
      };
      authWindowStub = {
        once: sinon.stub(),
        show: sinon.stub(),
        close: sinon.stub(),
        loadURL: sinon.stub(),
        isDestroyed: sinon.stub(),
        webContents: {
          session: {
            webRequest: {
              onCompleted: sinon.stub(),
            },
            clearStorageData: sinon.stub(),
          },
        },
      };

      urlCompleteHandlerResultStub = ['urlCompleteHandlerResultStub'];
      originalUrlCompleteHandler = oauthMethods.urlCompleteHandler;
      oauthMethods.urlCompleteHandler = sinon.stub().returns(urlCompleteHandlerResultStub);

      BrowserWindowStub.returns(authWindowStub);
      returnedFn = oauthMethods.openOauth(mainWindowStub, getOauthUrlsStub, completionEventStub);
      returnedFn(eventStub, configStub);
    });

    after(() => {
      oauthMethods.urlCompleteHandler = originalUrlCompleteHandler;
    });

    it('calls getOauthUrls() once with config', () => {
      getOauthUrlsStub.should.be.calledOnce().calledWithExactly(configStub);
    });

    it('calls BrowserWindow() once with `new` keyword and expected options', () => {
      BrowserWindowStub.should.be.calledOnce().calledWithNew().calledWithExactly({
        width: 500,
        height: 600,
        show: false,
        parent: mainWindowStub,
        alwaysOnTop: true,
        webPreferences: {
          contextIsolation: false,
          enableRemoteModule: false,
          nodeIntegration: false,
          partition: 'oauth',
        },
      });
    });

    it('calls authWindow.once() twice', () => {
      authWindowStub.once.should.be.calledTwice();
    });

    it('calls authWindow.once() with `ready-to-show` and authWindow.show()', () => {
      authWindowStub.once.should.be.calledWithExactly('ready-to-show', authWindowStub.show);
    });

    it('calls authWindow.once() with `focus` and function', () => {
      authWindowStub.once.secondCall.args[0].should.be.equal('show');
      authWindowStub.once.secondCall.args[1].should.be.a.Function();
    });

    describe('- authWindow.once(\'show\') listener', () => {
      before(() => {
        authWindowStub.once.args[1][1]();
      });

      it('calls mainWindow.once() once with `focus` and function', () => {
        mainWindowStub.once.should.be.calledOnce();
        mainWindowStub.once.firstCall.args[0].should.be.equal('focus');
        mainWindowStub.once.firstCall.args[1].should.be.a.Function();
      });

      describe('- mainWindow.once(\'focus\') listener', () => {
        describe('when authWindow.isDestroyed() returns true', () => {
          before(() => {
            authWindowStub.isDestroyed.returns(true);
            mainWindowStub.once.firstCall.args[1]();
          });

          after(() => {
            authWindowStub.isDestroyed.reset();
          });

          it('calls authWindow.isDestroyed() once', () => {
            authWindowStub.isDestroyed.should.be.calledOnce();
          });

          it('does NOT call authWindow.close()', () => {
            authWindowStub.close.should.not.be.called();
          });
        });

        describe('when authWindow.isDestroyed() returns false', () => {
          before(() => {
            authWindowStub.isDestroyed.returns(false);
            mainWindowStub.once.firstCall.args[1]();
          });

          after(() => {
            authWindowStub.close.resetHistory();
          });

          it('calls authWindow.isDestroyed() once', () => {
            authWindowStub.isDestroyed.should.be.calledOnce();
          });

          it('calls authWindow.close() once', () => {
            authWindowStub.close.should.be.calledOnce();
          });
        });
      });
    });

    it('calls authWindow.loadURL() once with urls.authUrl', () => {
      authWindowStub.loadURL.should.be.calledOnce().calledWithExactly(urlsStub.authUrl);
    });

    it('calls urlCompleteHandler() once with urls.redirectUri and function', () => {
      oauthMethods.urlCompleteHandler.should.be.calledOnce();
      oauthMethods.urlCompleteHandler.firstCall.args[0].should.be.equal(urlsStub.filterUri);
      oauthMethods.urlCompleteHandler.firstCall.args[1].should.be.a.Function();
    });

    describe('- authWindow.webContents.session.webRequest.onCompleted() callback function', () => {
      before(() => {
        authWindowStub.webContents.session.webRequest.onCompleted.reset();
      });

      after(() => {
        authWindowStub.webContents.session.webRequest.onCompleted.reset();
      });

      describe('when accessToken is truthy', () => {
        before(() => {
          oauthMethods.urlCompleteHandler.firstCall.args[1]('accessToken');
        });

        after(() => {
          authWindowStub.webContents.session.webRequest.onCompleted.reset();
          eventStub.sender.send.resetHistory();
          authWindowStub.close.resetHistory();
          authWindowStub.webContents.session.clearStorageData.resetHistory();
        });

        it('calls authWindow.webContents.session.webRequest.onCompleted() once with null as both args', () => {
          authWindowStub.webContents.session.webRequest.onCompleted.should.be.calledOnce()
            .calledWithExactly(oauthMethods.filter, null);
        });

        it('calls event.sender.send() once with completionEvent and accessToken', () => {
          eventStub.sender.send.should.be.calledOnce().calledWithExactly(completionEventStub, 'accessToken');
        });

        it('calls authWindow.close() once', () => {
          authWindowStub.close.should.be.calledOnce();
        });

        it('calls authWindow.webContents.session.clearStorageData() once', () => {
          authWindowStub.webContents.session.clearStorageData.should.be.calledOnce();
        });
      });

      describe('when accessToken is falsy', () => {
        before(() => {
          oauthMethods.urlCompleteHandler.firstCall.args[1]('');
        });

        after(() => {
          authWindowStub.close.resetHistory();
          authWindowStub.webContents.session.clearStorageData.resetHistory();
        });

        it('calls authWindow.webContents.session.webRequest.onCompleted() once with null as both args', () => {
          authWindowStub.webContents.session.webRequest.onCompleted.should.be.calledOnce()
            .calledWithExactly(oauthMethods.filter, null);
        });

        it('does NOT call event.sender.send()', () => {
          eventStub.sender.send.should.not.be.called();
        });

        it('calls authWindow.close() once', () => {
          authWindowStub.close.should.be.calledOnce();
        });

        it('calls authWindow.webContents.session.clearStorageData() once', () => {
          authWindowStub.webContents.session.clearStorageData.should.be.calledOnce();
        });
      });
    });

    it('calls authWindow.webContents.session.webRequest.onCompleted() once with spread urlCompleteHandler result', () => {
      authWindowStub.webContents.session.webRequest.onCompleted.should.be.calledOnce()
        .calledWithExactly(oauthMethods.filter, urlCompleteHandlerResultStub);
    });
  });
});
