const sinon = require('sinon');
const { importWithStubs } = require('../utils/importWithStubs');

const filePath = '/app/shareDialog';

const loadURLStub = sinon.stub();
const showStub = sinon.stub();
const hideStub = sinon.stub();
const onStub = sinon.stub();
const eventStub = {
  preventDefault: sinon.stub(),
};

function BrowserWindowStub(options = {}) {
  this.width = options.width;
  this.loadURL = loadURLStub;
  this.hide = hideStub;
  this.show = showStub;
  this.on = onStub;
}

describe(filePath, () => {
  let shareDialog;

  before(() => {
    shareDialog = importWithStubs(filePath, {
      electron: {
        BrowserWindow: BrowserWindowStub,
      },
    });
  });

  describe('openShareDialog(event, shareUrl)', () => {
    let shareWindow;

    before(() => {
      shareWindow = shareDialog.openShareDialog(eventStub, 'someurl');
    });

    it('loadURL should be called once with url', () => {
      loadURLStub.should.be.calledOnce().calledWithExactly('someurl');
    });

    it('show should be called once', () => {
      showStub.should.be.calledOnce();
    });

    it('on should be called once with close', () => {
      onStub.should.be.calledOnce().calledWith('close');
    });

    it('hide should not be called', () => {
      hideStub.should.not.be.called();
    });

    it('event.preventDefault should not be called', () => {
      eventStub.preventDefault.should.not.be.called();
    });

    describe('on close', () => {
      before(() => {
        shareDialog.onCloseCallback(shareWindow)(eventStub);
      });

      it('hide should be called once', () => {
        hideStub.should.be.calledOnce();
      });

      it('event.preventDefault should be called once', () => {
        eventStub.preventDefault.should.be.calledOnce();
      });
    });
  });
});
