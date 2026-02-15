const jsdom = require('jsdom');
const sinon = require('sinon');
const { importWithStubs } = require('../utils/importWithStubs');
const { windowBounds } = require('../../app/constants/store');
const { parseUrl, buildUrlSearchParams } = require('../../app/utils/url');
const events = require('../../app/constants/events');

const filePath = '/app/renderer';

const globalWindow = global.window;
const globalDocument = global.document;

const openExternalStub = sinon.stub();
const isDevStub = sinon.stub();
const initCrashReporter = sinon.stub();
const isMacEnvironmentStub = sinon.stub();
const isOauthProxyUrl = sinon.stub();
const packageJsonStub = {
  version: '9000.42.314',
};
const appleOauthLink = 'https://apple.com/some/link';
const googleOauthLink = 'https://google.com/another/link';
const storeGet = sinon.stub();
const getStoreStub = sinon.stub().returns({ get: storeGet });
storeGet.withArgs(windowBounds).returns({ height: 100, width: 100 });

const ipcRendererStub = {
  send: sinon.stub(),
};

const stopStub = sinon.stub();
const loadURLStub = sinon.stub();
const focusStub = sinon.stub();


const reset = () => {
  openExternalStub.reset();
  isDevStub.reset();
  getStoreStub.resetHistory();
  isOauthProxyUrl.resetHistory();
  ipcRendererStub.send.reset();
  focusStub.reset();
  stopStub.reset();
  loadURLStub.reset();
};

describe(filePath, () => {
  let renderer;
  let jsdomInstance;
  let webview;

  const indexHtml = `
    <body>
      <div class="draggable-region">
        <div class="nav-button nav-button--back"></div>
        <div class="nav-button nav-button--forward"></div>
      </div>
    
      <div class="loader">
        <div class="tunedin"></div>
      </div>
    
      <webview
        allowpopups
        class="hide"
        preload="./preload.js"
      ></webview>
    </body>
  `;

  before(() => {
    jsdomInstance = new jsdom.JSDOM(indexHtml, { pretendToBeVisual: true });
    global.window = jsdomInstance.window;
    global.document = jsdomInstance.window.document;
    webview = jsdomInstance.window.document.querySelector('webview');
    webview.stop = stopStub;
    webview.loadURL = loadURLStub;
    webview.focus = focusStub;
    isMacEnvironmentStub.returns(true);

    renderer = importWithStubs(filePath, {
      electron: {
        shell: {
          openExternal: openExternalStub,
        },
        ipcRenderer: ipcRendererStub,
      },
      'electron-is-dev': { default: isDevStub },
      './data/store': {
        getStore: getStoreStub,
      },
      './utils/initCrashReporter': initCrashReporter,
      './utils/isMacEnvironment': isMacEnvironmentStub,
      '../package.json': packageJsonStub,
      './utils/oauthUrlHelpers': { appleOauthLink, googleOauthLink },
      './utils/isOauthProxyUrl': isOauthProxyUrl,
      './utils/url': { parseUrl, buildUrlSearchParams },
      './env.json': { url: 'qa.tunein.com' },
    });
  });

  after(() => {
    global.window = globalWindow;
    global.document = globalDocument;
  });

  describe('handleOauthProxyRedirect()', () => {

    before(() => {
      sinon.spy(webview, 'removeEventListener');
    });

    describe('when url.hostname matches env hostname', () => {
      let event;

      before(() => {
        event = { url: 'https://qa.tunein.com' };
      });

      describe('when url does not have any search params', () => {
        before(() => {
          renderer.handleOauthProxyRedirect(event);
        });

        after(() => {
          reset();
          webview.removeEventListener.resetHistory();
        });

        it('removes event listener for did-navigate using handleOauthProxyRedirect', () => {
          webview.removeEventListener.should.be.calledOnce()
            .calledWithExactly('did-navigate', renderer.handleOauthProxyRedirect);
        });

        it('calls webview.stop() once', () => {
          stopStub.should.be.calledOnce();
        });

        it('calls webview.loadURL() once with expected URL', () => {
          loadURLStub.should.be.calledOnce()
            .calledWithExactly('https://qa.tunein.com/?dsktp=true&dsktp-rtid=undefined&dsktp-version=9000.42.314&dsktp-os=Macintosh');
        });
      });

      describe('when url does have search params', () => {
        before(() => {
          event.url += '?param=123';
          renderer.handleOauthProxyRedirect(event);
        });

        after(() => {
          reset();
          webview.removeEventListener.resetHistory();
        });

        it('does not remove event listener for did-navigate using handleOauthProxyRedirect', () => {
          webview.removeEventListener.should.not.be.called();
        });

        it('does not call webview.stop()', () => {
          stopStub.should.not.be.called();
        });

        it('does not call webview.loadURL()', () => {
          loadURLStub.should.not.be.called();
        });
      });
    });

    describe('when url.hostname does snot match env hostname', () => {
      let event;

      before(() => {
        event = { url: 'https://tunein.com' };
      });

      describe('when url does not have any search params', () => {
        before(() => {
          renderer.handleOauthProxyRedirect(event);
        });

        after(() => {
          webview.removeEventListener.resetHistory();
        });

        it('does not remove event listener for did-navigate using handleOauthProxyRedirect', () => {
          webview.removeEventListener.should.not.be.called();
        });

        it('does not call webview.stop()', () => {
          stopStub.should.not.be.called();
        });

        it('does not call webview.loadURL()', () => {
          loadURLStub.should.not.be.called();
        });
      });

      describe('when url does have search params', () => {
        before(() => {
          event.url += '?param=123';
          renderer.handleOauthProxyRedirect(event);
        });

        after(() => {
          webview.removeEventListener.resetHistory();
        });

        it('does not remove event listener for did-navigate using handleOauthProxyRedirect', () => {
          webview.removeEventListener.should.not.be.called();
        });

        it('does not call webview.stop()', () => {
          stopStub.should.not.be.called();
        });

        it('does not call webview.loadURL()', () => {
          loadURLStub.should.not.be.called();
        });
      });
    });
  });

  describe('handleWillNavigateEvent(e)', () => {
    let webviewFocusStop;
    const mockEvent1 = {
      url: 'https://ad.com',
    };

    const mockEvent2 = {
      url: 'https://ad-2.com',
    };

    // handleWillNavigateEvent depends on whether or not handleNewWindowEvent sets lastWindowOpened
    // this lastWindowOpened url is used here to to determine whether to stop the event
    before(() => {
      reset();
      webviewFocusStop = sinon.stub();
    });

    describe('when isOauthProxyUrl is true', () => {
      before(() => {
        isOauthProxyUrl.returns(true);
        sinon.spy(webview, 'addEventListener');
      });

      after(() => {
        reset();
        isOauthProxyUrl.returns(false);
        webview.addEventListener.restore();
      });

      describe('when isOauthProxyRedirectHandlerInitialized is false', () => {
        before(() => {
          renderer.handleWillNavigateEvent(mockEvent1);
        });

        after(() => {
          reset();
          webview.addEventListener.resetHistory();
        });

        it('adds an event listener for `did-navigate`', () => {
          const [event, handler] = webview.addEventListener.firstCall.args;
          webview.addEventListener.should.be.calledOnce();
          event.should.equal('did-navigate');
          handler.should.be.a.Function();
        });

        it('stop should not be called', () => {
          webviewFocusStop.should.not.be.called();
        });

        it('open external should not be called', () => {
          openExternalStub.should.not.be.called();
        });
      });

      describe('when isOauthProxyRedirectHandlerInitialized is true', () => {
        before(() => {
          renderer.handleWillNavigateEvent(mockEvent1);
        });

        after(reset);

        it('does not add an event listener for `did-navigate`', () => {
          webview.addEventListener.should.not.be.called();
        });

        it('stop should not be called', () => {
          webviewFocusStop.should.not.be.calledOnce();
        });

        it('open external should not be called', () => {
          openExternalStub.should.not.be.calledOnce();
        });
      });
    });

    describe('lastWindowOpened is not set, but url is external', () => {
      before(() => {
        renderer.handleWillNavigateEvent(mockEvent1);
      });

      after(reset);

      it('stop should be called', () => {
        stopStub.should.be.calledOnce();
      });

      it('open external should be called', () => {
        openExternalStub.should.be.calledOnce();
      });
    });

    describe('lastWindowOpened is set', () => {
      before(() => {
        reset();
        webviewFocusStop.reset();
        renderer.handleNewWindowEvent(mockEvent1);
        // openExternalStub need to be reset here because it's called once in
        // handleNewWindowEvent, this way we an test if it's called in handleWillNavigateEvent
        openExternalStub.reset();
        renderer.handleWillNavigateEvent(mockEvent1);
      });

      it('stop should be called', () => {
        stopStub.should.be.calledOnce();
      });

      it('open external should not be called', () => {
        openExternalStub.should.not.be.called();
      });
    });

    describe('if event link is external and is the different from lastWindowOpened url', () => {
      before(() => {
        reset();
        renderer.handleWillNavigateEvent(mockEvent2);
      });

      it('stop should be called', () => {
        stopStub.should.be.called();
      });

      it('open external should be called', () => {
        openExternalStub.should.be.calledOnce();
      });
    });
  });

  describe('handleNewWindowEvent(event)', () => {
    describe('for a random external link by', () => {
      const mockEvent = {
        url: 'https://some-ad.com',
      };

      before(() => {
        reset();
        renderer.handleNewWindowEvent(mockEvent);
      });

      it('open external should be called once', () => {
        openExternalStub.should.be.calledOnce().calledWithExactly(mockEvent.url);
      });
    });

    describe('for the google auth link', () => {
      const mockEvent = {
        url: googleOauthLink,
      };

      before(() => {
        reset();
        openExternalStub.reset();
        renderer.handleNewWindowEvent(mockEvent, true);
      });

      it('open external should not be called', () => {
        openExternalStub.should.not.be.called();
      });
    });

    describe('for the apple auth link', () => {
      const mockEvent = {
        url: appleOauthLink,
      };

      before(() => {
        reset();
        openExternalStub.reset();
        renderer.handleNewWindowEvent(mockEvent, true);
      });

      it('open external should not be called', () => {
        openExternalStub.should.not.be.called();
      });
    });

    describe('for the recurly paypal link', () => {
      const mockEvent = {
        url: 'https://checkout.paypal.com/web/something/something-else/',
      };

      before(() => {
        reset();
        renderer.handleNewWindowEvent(mockEvent);
      });

      it('open external should not be called', () => {
        openExternalStub.should.not.be.called();
      });
    });
  });

  describe('handleWindowFocus()', () => {
    const webviewFocusStub = sinon.stub();

    before(() => {
      webview.focus = webviewFocusStub;
      renderer.handleWindowFocus();
    });

    it('webview.focus is called', () => {
      webviewFocusStub.should.be.called();
    });
  });

  describe('setWebViewDimensions()', () => {
    before(() => {
      webview.setAttribute = sinon.stub();
      renderer.setWebViewDimensions();
    });

    it('sets the correct style attribute on the webview', () => {
      webview.setAttribute.should.be.calledOnce()
        .calledWith('style', 'height: 100px; width: 100px;');
    });
  });

  describe('getUrlToLoad()', () => {
    let value;

    describe('when is Mac environment', () => {
      before(() => {
        reset();
        value = renderer.getUrlToLoad();
      });

      it('returns the expected URL string', () => {
        value.should.equal('https://qa.tunein.com/?dsktp=true&dsktp-rtid=undefined&dsktp-version=9000.42.314&dsktp-os=Macintosh');
      });
    });

    describe('when is NOT Mac environment', () => {
      before(() => {
        reset();
        isMacEnvironmentStub.returns(false);
        value = renderer.getUrlToLoad();
      });

      it('returns the expected URL string', () => {
        value.should.equal('https://qa.tunein.com/?dsktp=true&dsktp-rtid=undefined&dsktp-version=9000.42.314&dsktp-os=Windows');
      });
    });
  });

  describe('handleBackNav()', () => {
    before(() => {
      webview.canGoBack = sinon.stub();
      webview.canGoBack.returns(false);
    });

    describe('when can NOT go back', () => {
      before(() => {
        renderer.handleBackNav();
      });

      after(reset);

      it('webview.canGoBack is called once', () => {
        webview.canGoBack.calledOnce.should.be.true();
      });
    });

    describe('when can go back', () => {
      before(() => {
        webview.canGoBack = sinon.stub().returns(true);
        renderer.handleBackNav();
      });

      after(reset);

      it('webview.canGoBack is called once', () => {
        webview.canGoBack.calledOnce.should.be.true();
      });

      it('webview.send is called once', () => {
        ipcRendererStub.send.should.be.calledOnce().calledWithExactly(events.historyBack);
      });
    });
  });

  describe('handleForwardNav()', () => {
    before(() => {
      webview.canGoForward = sinon.stub();
      webview.canGoForward.returns(false);
    });

    describe('when can NOT go forward', () => {
      before(() => {
        webview.canGoForward = sinon.stub();
        webview.canGoForward.returns(false);
        renderer.handleForwardNav();
      });

      after(reset);

      it('webview.canGoForward is called once', () => {
        webview.canGoForward.calledOnce.should.be.true();
      });

      it('webview.send is NOT called', () => {
        ipcRendererStub.send.should.not.be.called();
      });
    });

    describe('when can go forward', () => {
      before(() => {
        webview.canGoForward = sinon.stub();
        webview.canGoForward.returns(true);
        renderer.handleForwardNav();
      });

      after(reset);

      it('webview.canGoForward is called once', () => {
        webview.canGoForward.calledOnce.should.be.true();
      });

      it('webivew.send is called once', () => {
        ipcRendererStub.send.should.be.calledOnce().calledWithExactly(events.historyFwd);
      });
    });
  });
});
