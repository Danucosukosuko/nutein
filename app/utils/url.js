const { URL, URLSearchParams } = require('url');
const queryString = require('querystring');

module.exports = {
  parseUrl(url, createQueryObject = false) {
    try {
      const urlObject = new URL(url);

      if (!createQueryObject) {
        return urlObject;
      }

      // removing the ? from the search string
      const searchQueryToParse = urlObject.search.slice(1);
      urlObject.query = queryString.parse(searchQueryToParse);

      return urlObject;
    } catch {
      return {};
    }
  },

  buildUrlSearchParams(searchParams) {
    return new URLSearchParams(searchParams);
  },
};
