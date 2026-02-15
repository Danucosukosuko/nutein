const { importWithStubs } = require('../../../utils/importWithStubs');

const FIlE = '/app/utils/deeplink/createDeepLink';

describe(FIlE, () => {
  let createDeepLink;

  before(() => {
    createDeepLink = importWithStubs(FIlE, {
      '../../constants/general': { deepLinkProtocol: 'sarkhan' },
    });
  });

  describe('when called with a path', () => {
    let value;

    before(() => {
      value = createDeepLink('/greatest/');
    });

    it('returns the correct value', () => {
      value.should.be.eql('sarkhan://tunein.com/greatest/');
    });
  });
});
