const sinon = require('sinon');
const { importWithStubs } = require('../utils/importWithStubs');
const events = require('../../app/constants/events');

describe('app/attachIPCListeners', () => {
  let attachIPCListeners;
  const ipcRendererStub = {
    on: sinon.spy(),
  };

  before(() => {
    attachIPCListeners = importWithStubs('/app/attachIPCListeners', {
      electron: {
        ipcRenderer: ipcRendererStub,
      },
    });

    attachIPCListeners();
  });

  it('should call ipcRendererStub.on', () => {
    ipcRendererStub.on.callCount.should.be.equal(13);
    ipcRendererStub.on.getCall(0).args[0].should.be.equal(events.playToggle);
    ipcRendererStub.on.getCall(1).args[0].should.be.equal(events.volumeUp);
    ipcRendererStub.on.getCall(2).args[0].should.be.equal(events.volumeDown);
    ipcRendererStub.on.getCall(3).args[0].should.be.equal(events.historyFwd);
    ipcRendererStub.on.getCall(4).args[0].should.be.equal(events.historyBack);
    ipcRendererStub.on.getCall(5).args[0].should.be.equal(events.navigateToAccount);
    ipcRendererStub.on.getCall(6).args[0].should.be.equal(events.navigateToOptOutPage);
    ipcRendererStub.on.getCall(7).args[0].should.be.equal(events.openGdprSettings);
    ipcRendererStub.on.getCall(8).args[0].should.be.equal(events.logClientError);
    ipcRendererStub.on.getCall(9).args[0].should.be.equal(events.fbAuthenticated);
    ipcRendererStub.on.getCall(10).args[0].should.be.equal(events.search);
    ipcRendererStub.on.getCall(11).args[0].should.be.equal(events.activateDesktopUpdateBanner);
    ipcRendererStub.on.getCall(12).args[0].should.be.equal(events.handleGoogleAuth);
  });
});
