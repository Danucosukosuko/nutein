const sinon = require('sinon');
const { importWithStubs } = require('../../../utils/importWithStubs');

const { authorizePath } = require('../../../../app/constants/deepLinkRoutes');
const { rtid } = require('../../../../app/constants/store');
const events = require('../../../../app/constants/events');

const FILE = '/app/utils/deeplink/deepLinkEventHandler';

const sendAppEventStub = sinon.stub();
const storeGetStub = sinon.stub();
const getStoreStub = sinon.stub().returns({
  get: storeGetStub,
});

function reset() {
  sendAppEventStub.reset();
  storeGetStub.reset();
  getStoreStub.reset();
  getStoreStub.returns({
    get: storeGetStub,
  });
}

describe(FILE, () => {
  let deepLinkEventHandler;

  before(() => {
    deepLinkEventHandler = importWithStubs(FILE, {
      '../sendAppEvent': sendAppEventStub,
      '../../data/store': { getStore: getStoreStub },
    });
  });

  describe('when called with a parsed url object that has a supported pathname', () => {
    describe('and the store serial matches the serial in the query', () => {
      const serial = 'some serial';

      before(() => {
        reset();
        storeGetStub.returns(serial);
        deepLinkEventHandler({
          pathname: authorizePath,
          query: {
            serial,
            token: 'some token',
          },
        });
      });

      it('calls getStore', () => {
        getStoreStub.should.be.calledOnce();
      });

      it('calls store.get with correct args', () => {
        storeGetStub.should.be.calledOnce().calledWithExactly(rtid);
      });

      it('calls sendAppEvent with correct args', () => {
        sendAppEventStub.should.be.calledOnce().calledWithExactly(events.handleGoogleAuth, 'some token');
      });
    });

    describe('but the store serial does not match the serial in the query', () => {
      const serial = 'some serial';

      before(() => {
        reset();
        storeGetStub.returns(serial);
        deepLinkEventHandler({
          pathname: authorizePath,
          query: {
            serial: 'another serial',
            token: 'some token',
          },
        });
      });

      it('calls getStore', () => {
        getStoreStub.should.be.calledOnce();
      });

      it('calls store.get with correct args', () => {
        storeGetStub.should.be.calledOnce().calledWithExactly(rtid);
      });

      it('does not call sendAppEvent', () => {
        sendAppEventStub.should.not.be.called();
      });
    });

    describe('but the query does not have a token', () => {
      const serial = 'some serial';

      before(() => {
        reset();
        storeGetStub.returns(serial);
        deepLinkEventHandler({
          pathname: authorizePath,
          query: {
            serial,
          },
        });
      });

      it('calls getStore', () => {
        getStoreStub.should.be.calledOnce();
      });

      it('calls store.get with correct args', () => {
        storeGetStub.should.be.calledOnce().calledWithExactly(rtid);
      });

      it('does not call  sendAppEvent', () => {
        sendAppEventStub.should.not.be.called();
      });
    });
  });

  describe('when called with a parsed url boject that has a non-supported pathname', () => {
    describe('but the query does not have a token', () => {
      const serial = 'some serial';

      before(() => {
        reset();
        storeGetStub.returns(serial);
        deepLinkEventHandler({
          pathname: 'anotherpath',
          query: {
            serial,
            token: 'some token',
          },
        });
      });

      it('does not call getStore', () => {
        getStoreStub.should.not.be.called();
      });

      it('does not call store.get', () => {
        storeGetStub.should.not.be.called();
      });

      it('does not call sendAppEvent', () => {
        sendAppEventStub.should.not.be.called();
      });
    });
  });
});
