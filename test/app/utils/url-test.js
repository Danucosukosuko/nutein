const { URL, URLSearchParams } = require('url');
const queryString = require('querystring');
const { parseUrl, buildUrlSearchParams } = require('../../../app/utils/url');


describe('url', () => {
  describe('parseUrl()', () => {
    describe('when valid url is provided', () => {
      describe('when createQueryObject is false', () => {
        it('returns a URL object', () => {
          parseUrl('https://tunein.com?param=1').should.eql(new URL('https://tunein.com?param=1'));
        });
      });

      describe('when createQueryObject is true', () => {
        it('returns a URL object', () => {
          const url = new URL('https://tunein.com?param=1');
          url.query = queryString.parse('param=1');
          parseUrl('https://tunein.com?param=1', true).should.be.eql(url);
        });
      });
    });

    describe('when invalid url is provided', () => {
      it('returns a plain object', () => {
        parseUrl('tunein.com').should.eql({});
      });
    });
  });

  describe('buildUrlSearchParams()', () => {
    let searchParams;

    describe('when searchParams are a string', () => {
      before(() => {
        searchParams = '?param=1';
      });

      it('returns a URLSearchParams object', () => {
        buildUrlSearchParams(searchParams).should.eql(new URLSearchParams(searchParams));
      });
    });

    describe('when searchParams are an array', () => {
      before(() => {
        searchParams = [['param', 1], ['otherParam', true]];
      });

      it('returns a URLSearchParams object', () => {
        buildUrlSearchParams(searchParams).should.eql(new URLSearchParams(searchParams));
      });
    });

    describe('when searchParams are an object', () => {
      before(() => {
        searchParams = { param: 1 };
      });

      it('returns a URLSearchParams object', () => {
        buildUrlSearchParams(searchParams).should.eql(new URLSearchParams(searchParams));
      });
    });
  });
});
