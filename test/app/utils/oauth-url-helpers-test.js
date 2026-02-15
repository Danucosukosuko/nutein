const sinon = require('sinon');
const { importWithStubs } = require('../../utils/importWithStubs');
const { rtid, partnerId } = require('../../../app/constants/store');
const env = require('../../../app/env.json');

const FILE = '/app/utils/oauthUrlHelpers';

const createDeepLinkStub = sinon.stub();
const getStub = sinon.stub();
const getStoreStub = sinon.stub().returns({
  get: getStub,
});

function reset() {
  getStub.reset();
  getStoreStub.reset();
  getStoreStub.returns({
    get: getStub,
  });
};

describe(FILE, () => {
  let getTIGoogleAuthUrl;

  before(() => {
    getTIGoogleAuthUrl = importWithStubs(FILE, {
      '../data/store': { getStore: getStoreStub },
      './deeplink/createDeepLink': createDeepLinkStub,
    }).getTIGoogleAuthUrl;
  });

  describe('when called', () => {
    const serial = 'some serial';
    const desktopPartnerId = 'partner';

    before(() => {
      reset();
      getStub.withArgs(rtid).returns(serial);
      getStub.withArgs(partnerId).returns(desktopPartnerId);
    });

    it('returns the correct value', () => {
      getTIGoogleAuthUrl().should.be.eql(`https://${env.url}/desktop/auth?serial=${serial}&partnerId=${desktopPartnerId}`);
    });
  });
});
