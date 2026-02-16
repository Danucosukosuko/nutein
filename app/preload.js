const { ipcRenderer } = require('electron');
const transform = require('lodash/transform');
const events = require('./constants/events');
const {
  rtid,
  partnerId,
  nuteinTweaksEnabled,
  nuteinAdsEnabled,
  nuteinDisableTelemetryCrashReports,
  nuteinDisableUpdates,
} = require('./constants/store');
const localizationKeys = require('./constants/localizations');
const { getStore } = require('./data/store');

const attachIPCListeners = require('./attachIPCListeners');
const attachMousetrapListeners = require('./attachMousetrapListeners');

const store = getStore();

const defaultNuteinConfig = {
  tweaksEnabled: false,
  adsEnabled: false,
  disableTelemetryCrashReports: true,
  disableUpdates: true,
};

function getNuteinConfig() {
  const tweaksEnabled = store.get(nuteinTweaksEnabled);
  const adsEnabled = store.get(nuteinAdsEnabled);
  const disableTelemetryCrashReports = store.get(nuteinDisableTelemetryCrashReports);
  const disableUpdates = store.get(nuteinDisableUpdates);

  return {
    tweaksEnabled: typeof tweaksEnabled === 'boolean'
      ? tweaksEnabled
      : defaultNuteinConfig.tweaksEnabled,
    adsEnabled: typeof adsEnabled === 'boolean'
      ? adsEnabled
      : defaultNuteinConfig.adsEnabled,
    disableTelemetryCrashReports: typeof disableTelemetryCrashReports === 'boolean'
      ? disableTelemetryCrashReports
      : defaultNuteinConfig.disableTelemetryCrashReports,
    disableUpdates: typeof disableUpdates === 'boolean'
      ? disableUpdates
      : defaultNuteinConfig.disableUpdates,
  };
}

function setNuteinConfig(config = {}) {
  const currentConfig = getNuteinConfig();
  const nextConfig = {
    tweaksEnabled: typeof config.tweaksEnabled === 'boolean'
      ? config.tweaksEnabled
      : currentConfig.tweaksEnabled,
    adsEnabled: typeof config.adsEnabled === 'boolean'
      ? config.adsEnabled
      : currentConfig.adsEnabled,
    disableTelemetryCrashReports: typeof config.disableTelemetryCrashReports === 'boolean'
      ? config.disableTelemetryCrashReports
      : currentConfig.disableTelemetryCrashReports,
    disableUpdates: typeof config.disableUpdates === 'boolean'
      ? config.disableUpdates
      : currentConfig.disableUpdates,
  };

  store.set(nuteinTweaksEnabled, nextConfig.tweaksEnabled);
  store.set(nuteinAdsEnabled, nextConfig.adsEnabled);
  store.set(nuteinDisableTelemetryCrashReports, nextConfig.disableTelemetryCrashReports);
  store.set(nuteinDisableUpdates, nextConfig.disableUpdates);
}

function isTuneinHost() {
  return /(^|\.)tunein\.com$/i.test(window.location.hostname);
}

function removeUpsellButton() {
  const upsellButton = document.getElementById('sidebarUpsellLink');
  if (upsellButton) {
    upsellButton.remove();
  }
}

function injectTweaksCss() {
  if (document.getElementById('nutein-tweaks-style')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'nutein-tweaks-style';
  style.textContent = `
    [class*="leftSide-module__navigationMenuItemWrapper"] {
      margin-bottom: 2px !important;
    }

    [class*="leftSide-module__navigationMenuItem"] {
      border-radius: 10px !important;
    }

    [class*="leftSide-module__navigationMenuItem"]:hover {
      background: rgba(255, 255, 255, 0.06) !important;
    }

    [class*="simplebar-scrollbar"]::before {
      background: rgba(255, 255, 255, 0.35) !important;
    }
  `;

  const styleContainer = document.head || document.documentElement;
  styleContainer.appendChild(style);
}

function removeTweaksCss() {
  const style = document.getElementById('nutein-tweaks-style');
  if (style) {
    style.remove();
  }
}

function hideOptionalSidebarItems() {
  const optionalMenuTestIds = [
    'premiumMenuItem',
    'audiobooksMenuItem',
    'mapViewMenuItem',
  ];

  optionalMenuTestIds.forEach((testId) => {
    const menuItem = document.querySelector(`[data-testid="${testId}"]`);
    if (!menuItem) {
      return;
    }

    const wrapper = menuItem.closest('[class*="navigationMenuItemWrapper"]') || menuItem;
    wrapper.style.display = 'none';
  });
}

function restoreOptionalSidebarItems() {
  const hiddenItems = document.querySelectorAll('[data-testid="premiumMenuItem"], [data-testid="audiobooksMenuItem"], [data-testid="mapViewMenuItem"]');

  hiddenItems.forEach((menuItem) => {
    const wrapper = menuItem.closest('[class*="navigationMenuItemWrapper"]') || menuItem;
    wrapper.style.display = '';
  });
}

function removeAdsDomElements() {
  const sidebarUpsell = document.getElementById('sidebarUpsell');
  if (sidebarUpsell) {
    sidebarUpsell.remove();
  }

  const bottomBannerContainer = document.querySelector('[class*="bottom-banner-module__container"]');
  if (bottomBannerContainer) {
    bottomBannerContainer.remove();
  }

  const bottomBannerAd = document.getElementById('tunein_bottom_banner');
  if (bottomBannerAd) {
    const bottomBannerWrapper = bottomBannerAd.closest('[class*="bottom-banner-module__container"]')
      || bottomBannerAd.closest('div[style*="text-align: center"]')
      || bottomBannerAd;
    bottomBannerWrapper.remove();
  }

  const profileSideAd = document.getElementById('tunein_profile_side');
  if (profileSideAd) {
    const sideAdWrapper = profileSideAd.closest('div[style*="float: right"]')
      || profileSideAd;
    sideAdWrapper.remove();
  }

  const adUnitAnchor = document.getElementById('ad_unit');
  if (adUnitAnchor) {
    const adUnitWrapper = adUnitAnchor.closest('div[style*="float: right"]')
      || adUnitAnchor;
    adUnitWrapper.remove();
  }
}

function hideAdsWithCss() {
  if (document.getElementById('nutein-adblock-style')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'nutein-adblock-style';
  style.textContent = `
    #sidebarUpsell,
    #sidebarUpsellLink,
    #tunein_bottom_banner,
    #tunein_profile_side,
    #ad_unit,
    [data-freestar-ad],
    [id^="google_ads_iframe"],
    [id*="google_ads_iframe"],
    iframe[src*="doubleclick"],
    iframe[src*="googlesyndication"],
    iframe[title*="Anuncio"],
    iframe[aria-label*="Anuncio"],
    [class*="bottom-banner-module__container"],
    [class*="upsell-module__sidebarWrapper"],
    [class*="ad-module"],
    [data-testid="adUnit"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      max-height: 0 !important;
      pointer-events: none !important;
    }
  `;

  const styleContainer = document.head || document.documentElement;
  styleContainer.appendChild(style);
}

function removeAdblockCss() {
  const style = document.getElementById('nutein-adblock-style');
  if (style) {
    style.remove();
  }
}

function removeAdIframes() {
  const adIframes = document.querySelectorAll(
    'iframe[src*="doubleclick"], iframe[src*="googlesyndication"], iframe[id*="google_ads_iframe"], iframe[title*="Anuncio"], iframe[aria-label*="Anuncio"]',
  );

  adIframes.forEach((iframe) => {
    const wrapper = iframe.closest('[class*="bottom-banner-module__container"]')
      || iframe.closest('div[style*="text-align: center"]')
      || iframe.closest('div[style*="float: right"]')
      || iframe;
    wrapper.remove();
  });
}

function replaceTuneinCopyright() {
  const replacementUrl = 'https://github.com/danucosukosuko/nutein';
  const replacementText = `NuteIn Client: ${replacementUrl}`;
  const yearPattern = /©\s*\d{4}/i;

  const footerCandidates = document.querySelectorAll('footer, [class*="footer"], [id*="footer"], small, span, p, a');

  footerCandidates.forEach((element) => {
    const text = element.textContent || '';
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    if (!normalizedText) {
      return;
    }

    const hasTuneInInc = /tunein\s*,?\s*inc/i.test(normalizedText);
    const hasCopyright = yearPattern.test(normalizedText);

    if (hasTuneInInc && hasCopyright) {
      const copyrightPrefix = (normalizedText.match(yearPattern) || ['©'])[0];
      element.textContent = `${copyrightPrefix} ${replacementText}`;
      return;
    }

    if (/tunein\s*,?\s*inc/i.test(normalizedText) && /©/i.test(normalizedText)) {
      element.textContent = normalizedText.replace(/tunein\s*,?\s*inc/ig, replacementText);
      return;
    }

    if (/©\s*\d{4}\s*tunein/i.test(normalizedText)) {
      element.textContent = normalizedText
        .replace(/tunein\s*,?\s*inc/ig, replacementText)
        .replace(/©\s*(\d{4})\s*tunein/ig, '© $1 NuteIn Client');
    }
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const original = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (/©\s*\d{4}/i.test(original) && /tunein\s*,?\s*inc/i.test(original)) {
      const yearMatch = original.match(/©\s*\d{4}/i);
      const prefix = yearMatch ? yearMatch[0] : '©';
      node.textContent = `${prefix} ${replacementText}`;
    }
    node = walker.nextNode();
  }
}

function openNuteinSettingsModal() {
  if (document.getElementById('nutein-settings-modal-overlay')) {
    return;
  }

  const currentConfig = getNuteinConfig();
  const overlay = document.createElement('div');
  overlay.id = 'nutein-settings-modal-overlay';
  overlay.style.cssText = [
    'position: fixed',
    'inset: 0',
    'background: rgba(0, 0, 0, 0.45)',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'z-index: 999999',
  ].join(';');

  const modal = document.createElement('div');
  modal.style.cssText = [
    'width: min(420px, 92vw)',
    'background: #1c1d24',
    'color: #fff',
    'border: 1px solid #41434f',
    'border-radius: 12px',
    'padding: 20px',
    'font-family: sans-serif',
  ].join(';');

  modal.innerHTML = `
    <h2 style="margin:0 0 12px 0;font-size:20px;">NuteIn Settings</h2>
    <label style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
      <input id="nutein-tweaks-toggle" type="checkbox" ${currentConfig.tweaksEnabled ? 'checked' : ''} />
      <span>Activar tweaks visuales (limpieza + sidebar compacto)</span>
    </label>
    <label style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
      <input id="nutein-ads-toggle" type="checkbox" ${currentConfig.adsEnabled ? 'checked' : ''} />
      <span>Activar ADS (si está desactivado, se bloquean)</span>
    </label>
    <label style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
      <input id="nutein-disable-telemetry-toggle" type="checkbox" ${currentConfig.disableTelemetryCrashReports ? 'checked' : ''} />
      <span>Deshabilitar telemetría y crash reports</span>
    </label>
    <label style="display:flex;gap:10px;align-items:center;margin-bottom:16px;">
      <input id="nutein-disable-updates-toggle" type="checkbox" ${currentConfig.disableUpdates ? 'checked' : ''} />
      <span>Desactivar actualizaciones automáticas</span>
    </label>
    <div style="display:flex;justify-content:flex-end;gap:8px;">
      <button id="nutein-settings-cancel" type="button" style="padding:8px 12px;border-radius:8px;border:1px solid #555;background:#2a2d37;color:#fff;">Cancelar</button>
      <button id="nutein-settings-save" type="button" style="padding:8px 12px;border-radius:8px;border:1px solid #4f7dff;background:#4f7dff;color:#fff;">Guardar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  modal.querySelector('#nutein-settings-cancel').addEventListener('click', closeModal);
  modal.querySelector('#nutein-settings-save').addEventListener('click', () => {
    const tweaksEnabled = modal.querySelector('#nutein-tweaks-toggle').checked;
    const adsEnabled = modal.querySelector('#nutein-ads-toggle').checked;
    const disableTelemetryCrashReports = modal.querySelector('#nutein-disable-telemetry-toggle').checked;
    const disableUpdates = modal.querySelector('#nutein-disable-updates-toggle').checked;

    setNuteinConfig({
      tweaksEnabled,
      adsEnabled,
      disableTelemetryCrashReports,
      disableUpdates,
    });
    closeModal();
    window.location.reload();
  });
}

function injectNuteinMenuButton() {
  const sidebarNavLinks = document.getElementById('sidebarNavLinks');
  if (!sidebarNavLinks || document.getElementById('nutein-settings-menu-item')) {
    return;
  }

  const wrapperClass = sidebarNavLinks.querySelector('[class*="navigationMenuItemWrapper"]')?.className
    || 'leftSide-module__navigationMenuItemWrapper___wW1Lt';
  const linkClass = sidebarNavLinks.querySelector('[class*="navigationMenuItem___"]')?.className
    || 'leftSide-module__navigationMenuItem___snR6K common-module__link___Mz1h3';

  const wrapper = document.createElement('div');
  wrapper.className = wrapperClass;

  const button = document.createElement('button');
  button.id = 'nutein-settings-menu-item';
  button.type = 'button';
  button.className = linkClass;
  button.style.width = '100%';
  button.style.textAlign = 'left';
  button.style.border = 'none';
  button.style.background = 'transparent';
  button.textContent = 'NuteIn Settings:';
  button.addEventListener('click', openNuteinSettingsModal);

  wrapper.appendChild(button);
  sidebarNavLinks.appendChild(wrapper);
}

function applyNuteinTweaks() {
  if (!isTuneinHost()) {
    return;
  }

  const config = getNuteinConfig();

  injectNuteinMenuButton();

  if (!config.adsEnabled) {
    hideAdsWithCss();
    removeAdsDomElements();
    removeAdIframes();
  } else {
    removeAdblockCss();
  }

  replaceTuneinCopyright();

  if (!config.tweaksEnabled) {
    removeTweaksCss();
    restoreOptionalSidebarItems();
    return;
  }

  injectTweaksCss();
  removeUpsellButton();
  hideOptionalSidebarItems();
}

function startNuteinTweaksObserver() {
  if (!isTuneinHost()) {
    return;
  }

  applyNuteinTweaks();

  const observer = new MutationObserver(() => {
    applyNuteinTweaks();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/*
** in preload scripts, we have access to node.js and electron APIs
** the remote web app (tunein.com) will not, so this is safe
*/
function init() {
  window.Bridge = {};

  window.Bridge.getSerial = () => store.get(rtid);

  window.Bridge.setUpGeminiEventSender = () => {
    ipcRenderer.send(events.setUpGeminiEventSender);
  };

  window.Bridge.setUpLocalizations = () => {
    const getLocalizedText = window.Bridge.getLocalizedText || (v => v);
    const mapLocalizations = (mappedLocalizations, localizationKey) => {
      mappedLocalizations[localizationKey] = getLocalizedText(localizationKey);
    };
    const localizations = transform(localizationKeys, mapLocalizations, {});

    ipcRenderer.send(events.setUpLocalizations, localizations);
  };

  window.Bridge.getNuteinConfig = getNuteinConfig;
  window.Bridge.setNuteinConfig = setNuteinConfig;

  window.Bridge.setSerial = (rtidValue) => {
    store.set(rtid, rtidValue);
  };

  window.Bridge.setPartnerId = (partnerIdValue) => {
    store.set(partnerId, partnerIdValue);
  };

  window.Bridge.openfacebookAuth = (fbConfig) => {
    ipcRenderer.send(events.fbAuthenticate, fbConfig);
  };

  window.Bridge.openGoogleAuth = () => {
    ipcRenderer.send(events.openGoogleAuth);
  };

  window.Bridge.enableMenuPlayPause = () => {
    ipcRenderer.send(events.enableMenuPlayPause);
  };

  window.Bridge.showOptOutPageMenuItem = () => {
    ipcRenderer.send(events.showOptOutPageMenuItem);
  };

  window.Bridge.hideOptOutPageMenuItem = () => {
    ipcRenderer.send(events.hideOptOutPageMenuItem);
  };

  window.Bridge.showGdprSettingsMenuItem = () => {
    ipcRenderer.send(events.showGdprSettingsMenuItem);
  };

  window.Bridge.hideGdprSettingsMenuItem = () => {
    ipcRenderer.send(events.hideGdprSettingsMenuItem);
  };

  window.Bridge.openSocialShare = (url) => {
    ipcRenderer.send(events.openShareDialog, url);
  };

  window.Bridge.quitDesktopAndInstallUpdate = () => {
    ipcRenderer.send(events.quitDesktopAndInstallUpdate);
  };

  window.Bridge.reloadPage = () => {
    ipcRenderer.send(events.reloadPage);
  };

  attachIPCListeners();
  attachMousetrapListeners();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startNuteinTweaksObserver, { once: true });
  } else {
    startNuteinTweaksObserver();
  }
}

init();
