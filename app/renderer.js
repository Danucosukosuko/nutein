/*
  renderer.js is the javascript for the local index.html file, loaded via main.js
  the global window and document objects exist on the index.html, and the
  $webview references the website loaded in the webview tag
*/

const { shell, ipcRenderer } = require('electron');
const events = require('./constants/events');
const env = require('./env.json');
const { getStore } = require('./data/store');
const { rtid, windowBounds } = require('./constants/store');
const packageJson = require('../package.json');
const {
  isDesktopParamName,
  rtidParamName,
  versionParamName,
  osParamName,
} = require('./constants/queryParams');
const { googleOauthLink, appleOauthLink } = require('./utils/oauthUrlHelpers');
const isMacEnvironment = require('./utils/isMacEnvironment');
const isOauthProxyUrl = require('./utils/isOauthProxyUrl');
const { parseUrl, buildUrlSearchParams } = require('./utils/url');
const { initLogger } = require('./utils/logger');

const $webview = document.querySelector('webview');
const $loader = document.querySelector('.loader');
const $titlebar = document.querySelector('.draggable-titlebar');
const $backButton = document.querySelector('.nav-button--back');
const $forwardButton = document.querySelector('.nav-button--forward');
const store = getStore();

let lastWindowOpened;
let isOauthProxyRedirectHandlerRegistered = false;

/*
  environment url is set on start or build so that we can load it
  up dynamically and run with an npm script
*/
const [hostname, port] = env.url.split(':');

function getUrlToLoad() {
  const url = parseUrl(`https://${hostname}`);
  const searchParams = buildUrlSearchParams([
    [isDesktopParamName, true],
    [rtidParamName, store.get(rtid)],
    [versionParamName, packageJson.version],
    [osParamName, isMacEnvironment() ? 'Macintosh' : 'Windows'],
  ]);

  url.search = searchParams.toString();

  if (port) {
    url.port = port;
  }

  return url.toString();
}

// onDidStartLoading handles the loading state for the app
function onDidStartLoading() {
  $webview.removeEventListener('did-start-loading', onDidStartLoading);
  $webview.classList.add('hide');
  $loader.classList.remove('loader-hide');
}

// onDidStartLoading handles the removing the loading state when the site is ready
function onDomReady() {
  // inform main process of the webContentsId for the main webview
  ipcRenderer.send(events.setMainWebContents, $webview.getWebContentsId());

  initLogger({
    webContents: $webview,
    logPrefix: '[RENDERER]',
  });

  // Remove the explicit height and width styles on the webview so that it re-sizes
  // correctly when the browser window that hosts the app is re-sized.
  $webview.removeAttribute('style');
  $webview.classList.remove('hide');

  if (isMacEnvironment()) {
    $webview.classList.add('mac');
    $titlebar.classList.remove('hide');
  }
  // have to delay in order for the webview show/resize to settle
  setTimeout(() => {
    $loader.classList.add('loader-hide');
  }, 100);
}

/*
  The oauth proxy currently redirects to back to the env-specific URL without search params.
  This handler listens for that redirect and loads the proper "desktop" url from getUrlToLoad(),
  then unregisters itself as a listener.
*/
function handleOauthProxyRedirect(e) {
  const url = parseUrl(e.url);

  if (url.hostname === hostname && url.search === '') {
    $webview.removeEventListener('did-navigate', handleOauthProxyRedirect);
    $webview.stop();
    $webview.loadURL(getUrlToLoad());
  }
}

/*
  Sometimes an ad will also trigger this `will-navigate` event,
  when that happens, the ad opens in the browser. Listening
  here and catching if it was the same link that the browser opened
*/
function handleWillNavigateEvent(e) {
  const url = parseUrl(e.url);

  if (isOauthProxyUrl(url)) {
    if (!isOauthProxyRedirectHandlerRegistered) {
      $webview.addEventListener('did-navigate', handleOauthProxyRedirect);
      isOauthProxyRedirectHandlerRegistered = true;
    }
    return;
  }

  if (lastWindowOpened && lastWindowOpened === e.url) {
    $webview.stop();
  } else if (url.protocol === 'http:' || url.protocol === 'https:') {
    // prevent external links from opening within the app
    $webview.stop();
    shell.openExternal(e.url);
  }
}

// catch ads and open in browser, we manually handle known external urls in gemini
// we ignore google auth because it opens it's own popup
function handleNewWindowEvent(e) {
  const { protocol } = parseUrl(e.url);

  if (
    (protocol === 'http:' || protocol === 'https:')
    && (e.url.indexOf(googleOauthLink) === -1) // ignore google auth
    && (e.url.indexOf(appleOauthLink) === -1) // ignore apple auth
    && (!e.url.startsWith('https://checkout.paypal.com/web/')) // ignore paypal
  ) {
    lastWindowOpened = e.url;
    shell.openExternal(e.url);
  }
}

function handleWindowFocus() {
  $webview.focus();
}

function setWebViewDimensions() {
  const { width, height } = store.get(windowBounds);
  $webview.setAttribute('style', `height: ${height}px; width: ${width}px;`);
}

function handleBackNav() {
  if ($webview.canGoBack()) {
    ipcRenderer.send(events.historyBack);
  }
}

function handleForwardNav() {
  if ($webview.canGoForward()) {
    ipcRenderer.send(events.historyFwd);
  }
}

// Need to explicitly set the height and width on the webview so that the
// webview's window has set dimensions when the gemini web app loads.
// See TUNE-10903.
setWebViewDimensions();

$webview.src = getUrlToLoad();
$webview.addEventListener('did-start-loading', onDidStartLoading);
$webview.addEventListener('dom-ready', onDomReady);
$webview.addEventListener('will-navigate', handleWillNavigateEvent);
$webview.addEventListener('did-create-window', handleNewWindowEvent);

$backButton.addEventListener('click', handleBackNav);
$forwardButton.addEventListener('click', handleForwardNav);

window.addEventListener('focus', handleWindowFocus);

// exported for testing
module.exports = {
  handleWillNavigateEvent,
  handleNewWindowEvent,
  handleWindowFocus,
  setWebViewDimensions,
  getUrlToLoad,
  handleBackNav,
  handleForwardNav,
  handleOauthProxyRedirect,
};
