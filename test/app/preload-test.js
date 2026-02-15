const sinon = require('sinon');
const { importWithStubs } = require('../utils/importWithStubs');
const events = require('../../app/constants/events');

const path = '/app/preload';

describe(path, () => {
  const ipcRendererStub = {
    send: sinon.stub(),
  };
  const storeConstantsStub = { rtid: 'rtid', partnerId: 'partnerId' };
  const localizationKeysStub = {
    key1: 'key.1',
    key2: 'key.2',
  };
  const storeStub = {
    get: sinon.stub(),
    set: sinon.stub(),
  };
  const getStoreStub = {
    getStore: sinon.stub().returns(storeStub),
  };
  const attachIPCListenersStub = sinon.stub();
  const attachMousetrapListenersStub = sinon.stub();

  before(() => {
    importWithStubs(path, {
      electron: { ipcRenderer: ipcRendererStub },
      './constants/store': storeConstantsStub,
      './constants/localizations': localizationKeysStub,
      './data/store': getStoreStub,
      './attachIPCListeners': attachIPCListenersStub,
      './attachMousetrapListeners': attachMousetrapListenersStub,
    });
  });

  it('calls attachIPCListeners once', () => {
    attachIPCListenersStub.should.be.calledOnce();
  });

  it('calls attachMousetrapListeners once', () => {
    attachMousetrapListenersStub.should.be.calledOnce();
  });

  describe('getSerial', () => {
    before(() => {
      window.Bridge.getSerial();
    });

    after(() => {
      storeStub.get.reset();
    });

    it('calls store.get() once with rtid constant', () => {
      storeStub.get.should.be.calledOnce().calledWithExactly(storeConstantsStub.rtid);
    });
  });

  describe('setUpLocalizations', () => {
    before(() => {
      window.Bridge.getLocalizedText = (v => `${v}_value`);
      window.Bridge.setUpLocalizations();
    });

    after(() => {
      delete window.Bridge.getLocalizedText;
      ipcRendererStub.send.reset();
    });

    it('calls ipcRenderer.send() once with expected args', () => {
      ipcRendererStub.send.should.be.calledOnce().calledWithExactly(
        events.setUpLocalizations,
        {
          'key.1': 'key.1_value',
          'key.2': 'key.2_value',
        },
      );
    });

    describe('when getLocalizedText is not on Bridge', () => {
      before(() => {
        delete window.Bridge.getLocalizedText;
        ipcRendererStub.send.reset();

        window.Bridge.setUpLocalizations();
      });

      after(() => {
        ipcRendererStub.send.reset();
      });

      it('calls ipcRenderer.send() once with expected args', () => {
        ipcRendererStub.send.should.be.calledOnce().calledWithExactly(
          events.setUpLocalizations,
          {
            'key.1': 'key.1',
            'key.2': 'key.2',
          },
        );
      });
    });
  });

  describe('setUpGeminiEventSender', () => {
    before(() => {
      window.Bridge.setUpGeminiEventSender();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRenderer.send() once with expected args', () => {
      ipcRendererStub.send.should.be.calledOnce().calledWithExactly(events.setUpGeminiEventSender);
    });
  });

  describe('setSerial', () => {
    const rtidValue = 'rtidValue';

    before(() => {
      window.Bridge.setSerial(rtidValue);
    });

    after(() => {
      storeStub.set.reset();
    });

    it('calls store.set() once with rtid constant and new rtid value', () => {
      storeStub.set.should.be.calledOnce().calledWithExactly(storeConstantsStub.rtid, rtidValue);
    });
  });

  describe('setPartnerId', () => {
    const partnerIdValue = 'partnerIdValue';

    before(() => {
      window.Bridge.setPartnerId(partnerIdValue);
    });

    after(() => {
      storeStub.set.reset();
    });

    it('calls store.set() once with partnerId constant and new partnerId value', () => {
      storeStub.set.should.be.calledOnce()
        .calledWithExactly(storeConstantsStub.partnerId, partnerIdValue);
    });
  });

  describe('openfacebookAuth', () => {
    const fbConfig = 'fbConfig';

    before(() => {
      window.Bridge.openfacebookAuth(fbConfig);
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with fbConfig', () => {
      ipcRendererStub.send.should.be.calledOnce()
        .calledWithExactly(events.fbAuthenticate, fbConfig);
    });
  });

  describe('openGoogleAuth', () => {
    before(() => {
      window.Bridge.openGoogleAuth();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with fbConfig', () => {
      ipcRendererStub.send.should.be.calledOnce()
        .calledWithExactly(events.openGoogleAuth);
    });
  });

  describe('enableMenuPlayPause', () => {
    before(() => {
      window.Bridge.enableMenuPlayPause();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with enableMenuPlayPause event constant', () => {
      ipcRendererStub.send.should.be.calledOnce().calledWithExactly(events.enableMenuPlayPause);
    });
  });

  describe('showOptOutPageMenuItem', () => {
    before(() => {
      window.Bridge.showOptOutPageMenuItem();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with showOptOutPageMenuItem event constant', () => {
      ipcRendererStub.send.should.be.calledOnce().calledWithExactly(events.showOptOutPageMenuItem);
    });
  });

  describe('hideOptOutPageMenuItem', () => {
    before(() => {
      window.Bridge.hideOptOutPageMenuItem();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with hideOptOutPageMenuItem event constant', () => {
      ipcRendererStub.send.should.be.calledOnce().calledWithExactly(events.hideOptOutPageMenuItem);
    });
  });

  describe('showGdprSettingsMenuItem', () => {
    before(() => {
      window.Bridge.showGdprSettingsMenuItem();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with showGdprSettingsMenuItem event constant', () => {
      ipcRendererStub.send.should.be.calledOnce()
        .calledWithExactly(events.showGdprSettingsMenuItem);
    });
  });

  describe('hideGdprSettingsMenuItem', () => {
    before(() => {
      window.Bridge.hideGdprSettingsMenuItem();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with hideGdprSettingsMenuItem event constant', () => {
      ipcRendererStub.send.should.be.calledOnce()
        .calledWithExactly(events.hideGdprSettingsMenuItem);
    });
  });

  describe('openSocialShare', () => {
    const url = 'url';

    before(() => {
      window.Bridge.openSocialShare(url);
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with openShareDialog event constant and url', () => {
      ipcRendererStub.send.should.be.calledOnce()
        .calledWithExactly(events.openShareDialog, url);
    });
  });

  describe('quitDesktopAndInstallUpdate', () => {
    before(() => {
      window.Bridge.quitDesktopAndInstallUpdate();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with quitDesktopAndInstallUpdate event constant', () => {
      ipcRendererStub.send.should.be.calledOnce()
        .calledWithExactly(events.quitDesktopAndInstallUpdate);
    });
  });

  describe('reloadPage', () => {
    before(() => {
      window.Bridge.reloadPage();
    });

    after(() => {
      ipcRendererStub.send.reset();
    });

    it('calls ipcRendererStub.send() once with reloadPage event constant', () => {
      ipcRendererStub.send.should.be.calledOnce()
        .calledWithExactly(events.reloadPage);
    });
  });
});
