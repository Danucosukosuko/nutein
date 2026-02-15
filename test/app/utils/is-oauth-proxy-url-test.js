const isOauthProxyUrl = require('../../../app/utils/isOauthProxyUrl');

describe('isOauthProxyUrl', () => {
  let url;

  describe('when hostname is equal to Okta Oauth hostname', () => {
    before(() => {
      url = new URL('https://tunein.okta.com');
    });

    it('returns true', () => {
      isOauthProxyUrl(url).should.be.true();
    });
  });

  describe('when hostname is not equal to Okta Oauth hostname', () => {
    describe('when url passes oauth proxy regex test', () => {
      describe('when url is tunein.com subdomain without `beta` prefix', () => {
        before(() => {
          url = new URL('https://dev.tunein.com/oauth2/randomEndpoint');
        });

        it('returns true', () => {
          isOauthProxyUrl(url).should.be.true();
        });
      });

      describe('when url is tunein.com subdomain with `beta` prefix', () => {
        before(() => {
          url = new URL('https://stage-beta.tunein.com/oauth2/login');
        });

        it('returns true', () => {
          isOauthProxyUrl(url).should.be.true();
        });
      });

      describe('when url is k8s domain', () => {
        before(() => {
          url = new URL('https://web-gemini-web-pr-tune-12345-some-pr-description.k8s.nonprod.us-west-2.tunenet.io/oauth2/callback');
        });

        it('returns true', () => {
          isOauthProxyUrl(url).should.be.true();
        });
      });
    });

    describe('when url does not pass oauth proxy regex test', () => {
      before(() => {
        url = new URL('https://stage-beta.tunein.org/oauth9000/login');
      });

      it('returns true', () => {
        isOauthProxyUrl(url).should.be.false();
      });
    });
  });
});
