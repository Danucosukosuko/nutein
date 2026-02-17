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
  nuteinHidePremiumMenu,
  nuteinHideAudiobooksMenu,
  nuteinHideRadioMenu,
  nuteinHideRecentsMenu,
  nuteinHideMusicMenu,
  nuteinHideSportsMenu,
  nuteinHideNewsMenu,
  nuteinHidePodcastsMenu,
  nuteinHideRegionsMenu,
  nuteinHideLanguagesMenu,
  nuteinDevDisableAnimations,
  nuteinDevReduceMotion,
  nuteinDevShowDebugOutline,
  nuteinDevHighContrast,
  nuteinDevMonoFont,
  nuteinDevCompactPlayer,
  nuteinDevHideHeaderPromo,
  nuteinDevHideSocialShare,
  nuteinDevHideBadges,
  nuteinDevHideFooterLinks,
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
  hidePremiumMenu: false,
  hideAudiobooksMenu: false,
  hideRadioMenu: false,
  hideRecentsMenu: false,
  hideMusicMenu: false,
  hideSportsMenu: false,
  hideNewsMenu: false,
  hidePodcastsMenu: false,
  hideRegionsMenu: false,
  hideLanguagesMenu: false,
  devDisableAnimations: false,
  devReduceMotion: false,
  devShowDebugOutline: false,
  devHighContrast: false,
  devMonoFont: false,
  devCompactPlayer: false,
  devHideHeaderPromo: false,
  devHideSocialShare: false,
  devHideBadges: false,
  devHideFooterLinks: false,
};

function getBooleanConfigValue(value, fallbackValue) {
  return typeof value === 'boolean' ? value : fallbackValue;
}

function getNuteinConfig() {
  return {
    tweaksEnabled: getBooleanConfigValue(store.get(nuteinTweaksEnabled), defaultNuteinConfig.tweaksEnabled),
    adsEnabled: getBooleanConfigValue(store.get(nuteinAdsEnabled), defaultNuteinConfig.adsEnabled),
    disableTelemetryCrashReports: getBooleanConfigValue(
      store.get(nuteinDisableTelemetryCrashReports),
      defaultNuteinConfig.disableTelemetryCrashReports,
    ),
    disableUpdates: getBooleanConfigValue(store.get(nuteinDisableUpdates), defaultNuteinConfig.disableUpdates),
    hidePremiumMenu: getBooleanConfigValue(store.get(nuteinHidePremiumMenu), defaultNuteinConfig.hidePremiumMenu),
    hideAudiobooksMenu: getBooleanConfigValue(store.get(nuteinHideAudiobooksMenu), defaultNuteinConfig.hideAudiobooksMenu),
    hideRadioMenu: getBooleanConfigValue(store.get(nuteinHideRadioMenu), defaultNuteinConfig.hideRadioMenu),
    hideRecentsMenu: getBooleanConfigValue(store.get(nuteinHideRecentsMenu), defaultNuteinConfig.hideRecentsMenu),
    hideMusicMenu: getBooleanConfigValue(store.get(nuteinHideMusicMenu), defaultNuteinConfig.hideMusicMenu),
    hideSportsMenu: getBooleanConfigValue(store.get(nuteinHideSportsMenu), defaultNuteinConfig.hideSportsMenu),
    hideNewsMenu: getBooleanConfigValue(store.get(nuteinHideNewsMenu), defaultNuteinConfig.hideNewsMenu),
    hidePodcastsMenu: getBooleanConfigValue(store.get(nuteinHidePodcastsMenu), defaultNuteinConfig.hidePodcastsMenu),
    hideRegionsMenu: getBooleanConfigValue(store.get(nuteinHideRegionsMenu), defaultNuteinConfig.hideRegionsMenu),
    hideLanguagesMenu: getBooleanConfigValue(store.get(nuteinHideLanguagesMenu), defaultNuteinConfig.hideLanguagesMenu),
    devDisableAnimations: getBooleanConfigValue(store.get(nuteinDevDisableAnimations), defaultNuteinConfig.devDisableAnimations),
    devReduceMotion: getBooleanConfigValue(store.get(nuteinDevReduceMotion), defaultNuteinConfig.devReduceMotion),
    devShowDebugOutline: getBooleanConfigValue(store.get(nuteinDevShowDebugOutline), defaultNuteinConfig.devShowDebugOutline),
    devHighContrast: getBooleanConfigValue(store.get(nuteinDevHighContrast), defaultNuteinConfig.devHighContrast),
    devMonoFont: getBooleanConfigValue(store.get(nuteinDevMonoFont), defaultNuteinConfig.devMonoFont),
    devCompactPlayer: getBooleanConfigValue(store.get(nuteinDevCompactPlayer), defaultNuteinConfig.devCompactPlayer),
    devHideHeaderPromo: getBooleanConfigValue(store.get(nuteinDevHideHeaderPromo), defaultNuteinConfig.devHideHeaderPromo),
    devHideSocialShare: getBooleanConfigValue(store.get(nuteinDevHideSocialShare), defaultNuteinConfig.devHideSocialShare),
    devHideBadges: getBooleanConfigValue(store.get(nuteinDevHideBadges), defaultNuteinConfig.devHideBadges),
    devHideFooterLinks: getBooleanConfigValue(store.get(nuteinDevHideFooterLinks), defaultNuteinConfig.devHideFooterLinks),
  };
}

function setNuteinConfig(config = {}) {
  const currentConfig = getNuteinConfig();
  const nextConfig = {
    tweaksEnabled: typeof config.tweaksEnabled === 'boolean' ? config.tweaksEnabled : currentConfig.tweaksEnabled,
    adsEnabled: typeof config.adsEnabled === 'boolean' ? config.adsEnabled : currentConfig.adsEnabled,
    disableTelemetryCrashReports: typeof config.disableTelemetryCrashReports === 'boolean'
      ? config.disableTelemetryCrashReports
      : currentConfig.disableTelemetryCrashReports,
    disableUpdates: typeof config.disableUpdates === 'boolean' ? config.disableUpdates : currentConfig.disableUpdates,
    hidePremiumMenu: typeof config.hidePremiumMenu === 'boolean' ? config.hidePremiumMenu : currentConfig.hidePremiumMenu,
    hideAudiobooksMenu: typeof config.hideAudiobooksMenu === 'boolean' ? config.hideAudiobooksMenu : currentConfig.hideAudiobooksMenu,
    hideRadioMenu: typeof config.hideRadioMenu === 'boolean' ? config.hideRadioMenu : currentConfig.hideRadioMenu,
    hideRecentsMenu: typeof config.hideRecentsMenu === 'boolean' ? config.hideRecentsMenu : currentConfig.hideRecentsMenu,
    hideMusicMenu: typeof config.hideMusicMenu === 'boolean' ? config.hideMusicMenu : currentConfig.hideMusicMenu,
    hideSportsMenu: typeof config.hideSportsMenu === 'boolean' ? config.hideSportsMenu : currentConfig.hideSportsMenu,
    hideNewsMenu: typeof config.hideNewsMenu === 'boolean' ? config.hideNewsMenu : currentConfig.hideNewsMenu,
    hidePodcastsMenu: typeof config.hidePodcastsMenu === 'boolean' ? config.hidePodcastsMenu : currentConfig.hidePodcastsMenu,
    hideRegionsMenu: typeof config.hideRegionsMenu === 'boolean' ? config.hideRegionsMenu : currentConfig.hideRegionsMenu,
    hideLanguagesMenu: typeof config.hideLanguagesMenu === 'boolean'
      ? config.hideLanguagesMenu
      : currentConfig.hideLanguagesMenu,
    devDisableAnimations: typeof config.devDisableAnimations === 'boolean'
      ? config.devDisableAnimations
      : currentConfig.devDisableAnimations,
    devReduceMotion: typeof config.devReduceMotion === 'boolean'
      ? config.devReduceMotion
      : currentConfig.devReduceMotion,
    devShowDebugOutline: typeof config.devShowDebugOutline === 'boolean'
      ? config.devShowDebugOutline
      : currentConfig.devShowDebugOutline,
    devHighContrast: typeof config.devHighContrast === 'boolean'
      ? config.devHighContrast
      : currentConfig.devHighContrast,
    devMonoFont: typeof config.devMonoFont === 'boolean'
      ? config.devMonoFont
      : currentConfig.devMonoFont,
    devCompactPlayer: typeof config.devCompactPlayer === 'boolean'
      ? config.devCompactPlayer
      : currentConfig.devCompactPlayer,
    devHideHeaderPromo: typeof config.devHideHeaderPromo === 'boolean'
      ? config.devHideHeaderPromo
      : currentConfig.devHideHeaderPromo,
    devHideSocialShare: typeof config.devHideSocialShare === 'boolean'
      ? config.devHideSocialShare
      : currentConfig.devHideSocialShare,
    devHideBadges: typeof config.devHideBadges === 'boolean'
      ? config.devHideBadges
      : currentConfig.devHideBadges,
    devHideFooterLinks: typeof config.devHideFooterLinks === 'boolean'
      ? config.devHideFooterLinks
      : currentConfig.devHideFooterLinks,
  };

  store.set(nuteinTweaksEnabled, nextConfig.tweaksEnabled);
  store.set(nuteinAdsEnabled, nextConfig.adsEnabled);
  store.set(nuteinDisableTelemetryCrashReports, nextConfig.disableTelemetryCrashReports);
  store.set(nuteinDisableUpdates, nextConfig.disableUpdates);
  store.set(nuteinHidePremiumMenu, nextConfig.hidePremiumMenu);
  store.set(nuteinHideAudiobooksMenu, nextConfig.hideAudiobooksMenu);
  store.set(nuteinHideRadioMenu, nextConfig.hideRadioMenu);
  store.set(nuteinHideRecentsMenu, nextConfig.hideRecentsMenu);
  store.set(nuteinHideMusicMenu, nextConfig.hideMusicMenu);
  store.set(nuteinHideSportsMenu, nextConfig.hideSportsMenu);
  store.set(nuteinHideNewsMenu, nextConfig.hideNewsMenu);
  store.set(nuteinHidePodcastsMenu, nextConfig.hidePodcastsMenu);
  store.set(nuteinHideRegionsMenu, nextConfig.hideRegionsMenu);
  store.set(nuteinHideLanguagesMenu, nextConfig.hideLanguagesMenu);
  store.set(nuteinDevDisableAnimations, nextConfig.devDisableAnimations);
  store.set(nuteinDevReduceMotion, nextConfig.devReduceMotion);
  store.set(nuteinDevShowDebugOutline, nextConfig.devShowDebugOutline);
  store.set(nuteinDevHighContrast, nextConfig.devHighContrast);
  store.set(nuteinDevMonoFont, nextConfig.devMonoFont);
  store.set(nuteinDevCompactPlayer, nextConfig.devCompactPlayer);
  store.set(nuteinDevHideHeaderPromo, nextConfig.devHideHeaderPromo);
  store.set(nuteinDevHideSocialShare, nextConfig.devHideSocialShare);
  store.set(nuteinDevHideBadges, nextConfig.devHideBadges);
  store.set(nuteinDevHideFooterLinks, nextConfig.devHideFooterLinks);
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

function setSidebarItemHidden(testId, shouldHide) {
  const menuItem = document.querySelector(`[data-testid="${testId}"]`);
  if (!menuItem) {
    return;
  }

  const wrapper = menuItem.closest('[class*="navigationMenuItemWrapper"]') || menuItem;
  wrapper.style.display = shouldHide ? 'none' : '';
}

function applySidebarVisibilityTweaks(config) {
  setSidebarItemHidden('premiumMenuItem', config.hidePremiumMenu);
  setSidebarItemHidden('audiobooksMenuItem', config.hideAudiobooksMenu);
  setSidebarItemHidden('mapViewMenuItem', config.hideRadioMenu);
  setSidebarItemHidden('recentsMenuItem', config.hideRecentsMenu);
  setSidebarItemHidden('musicMenuItem', config.hideMusicMenu);
  setSidebarItemHidden('sportsMenuItem', config.hideSportsMenu);
  setSidebarItemHidden('newsMenuItem', config.hideNewsMenu);
  setSidebarItemHidden('podcastsMenuItem', config.hidePodcastsMenu);
  setSidebarItemHidden('regionsMenuItem', config.hideRegionsMenu);
  setSidebarItemHidden('languagesMenuItem', config.hideLanguagesMenu);
}

function restoreSidebarVisibilityTweaks() {
  [
    'premiumMenuItem',
    'audiobooksMenuItem',
    'mapViewMenuItem',
    'recentsMenuItem',
    'musicMenuItem',
    'sportsMenuItem',
    'newsMenuItem',
    'podcastsMenuItem',
    'regionsMenuItem',
    'languagesMenuItem',
  ].forEach(testId => setSidebarItemHidden(testId, false));
}

function applyDevFlagsCss(config) {
  const styleId = 'nutein-dev-flags-style';
  let style = document.getElementById(styleId);

  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    const styleContainer = document.head || document.documentElement;
    styleContainer.appendChild(style);
  }

  const rules = [];

  if (config.devDisableAnimations) {
    rules.push('* { animation: none !important; transition: none !important; }');
  }
  if (config.devReduceMotion) {
    rules.push('html { scroll-behavior: auto !important; }');
  }
  if (config.devShowDebugOutline) {
    rules.push('* { outline: 1px dashed rgba(255, 0, 255, 0.2) !important; }');
  }
  if (config.devHighContrast) {
    rules.push('body { filter: contrast(1.15) !important; }');
  }
  if (config.devMonoFont) {
    rules.push('body, button, a, span, p, div { font-family: "Consolas", "Menlo", monospace !important; }');
  }
  if (config.devCompactPlayer) {
    rules.push('[class*="player"], [id*="player"] { min-height: 40px !important; max-height: 64px !important; }');
  }
  if (config.devHideHeaderPromo) {
    rules.push('[class*="header"] [class*="promo"], [class*="upsell"] { display: none !important; }');
  }
  if (config.devHideSocialShare) {
    rules.push('[class*="share"], [data-testid*="share"] { display: none !important; }');
  }
  if (config.devHideBadges) {
    rules.push('[class*="badge"], [data-testid*="badge"] { display: none !important; }');
  }
  if (config.devHideFooterLinks) {
    rules.push('footer a, [class*="footer"] a { display: none !important; }');
  }

  style.textContent = rules.join('\n');
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
    'width: min(980px, 96vw)',
    'max-height: 88vh',
    'overflow: auto',
    'background: #1c1d24',
    'color: #fff',
    'border: 1px solid #41434f',
    'border-radius: 12px',
    'padding: 20px',
    'font-family: sans-serif',
  ].join(';');

  modal.innerHTML = `
    <h2 style="margin:0 0 14px 0;font-size:22px;">NuteIn Settings</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
      <section>
        <h3 style="margin:0 0 10px 0;font-size:15px;opacity:.9;">Core Settings</h3>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
          <input id="nutein-tweaks-toggle" type="checkbox" ${currentConfig.tweaksEnabled ? 'checked' : ''} />
          <span>Enable visual tweaks (cleanup + compact sidebar)</span>
        </label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
          <input id="nutein-ads-toggle" type="checkbox" ${currentConfig.adsEnabled ? 'checked' : ''} />
          <span>Enable ads (disabled means blocked)</span>
        </label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
          <input id="nutein-disable-telemetry-toggle" type="checkbox" ${currentConfig.disableTelemetryCrashReports ? 'checked' : ''} />
          <span>Disable telemetry and crash reports</span>
        </label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:16px;">
          <input id="nutein-disable-updates-toggle" type="checkbox" ${currentConfig.disableUpdates ? 'checked' : ''} />
          <span>Disable automatic updates</span>
        </label>

        <h3 style="margin:0 0 10px 0;font-size:15px;opacity:.9;">Sidebar Visibility Tweaks</h3>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-premium-menu-toggle" type="checkbox" ${currentConfig.hidePremiumMenu ? 'checked' : ''} /><span>Hide Premium</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-audiobooks-menu-toggle" type="checkbox" ${currentConfig.hideAudiobooksMenu ? 'checked' : ''} /><span>Hide Audiobooks</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-radio-menu-toggle" type="checkbox" ${currentConfig.hideRadioMenu ? 'checked' : ''} /><span>Hide Radio</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-recents-menu-toggle" type="checkbox" ${currentConfig.hideRecentsMenu ? 'checked' : ''} /><span>Hide Recents</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-music-menu-toggle" type="checkbox" ${currentConfig.hideMusicMenu ? 'checked' : ''} /><span>Hide Music</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-sports-menu-toggle" type="checkbox" ${currentConfig.hideSportsMenu ? 'checked' : ''} /><span>Hide Sports</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-news-menu-toggle" type="checkbox" ${currentConfig.hideNewsMenu ? 'checked' : ''} /><span>Hide News & Talk</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-podcasts-menu-toggle" type="checkbox" ${currentConfig.hidePodcastsMenu ? 'checked' : ''} /><span>Hide Podcasts</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-regions-menu-toggle" type="checkbox" ${currentConfig.hideRegionsMenu ? 'checked' : ''} /><span>Hide By Location</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-hide-languages-menu-toggle" type="checkbox" ${currentConfig.hideLanguagesMenu ? 'checked' : ''} /><span>Hide By Language</span></label>
      </section>

      <section>
        <h3 style="margin:0 0 10px 0;font-size:15px;opacity:.9;">Development / Internal Flags</h3>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-disable-animations-toggle" type="checkbox" ${currentConfig.devDisableAnimations ? 'checked' : ''} /><span>Disable animations</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-reduce-motion-toggle" type="checkbox" ${currentConfig.devReduceMotion ? 'checked' : ''} /><span>Reduce motion</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-show-debug-outline-toggle" type="checkbox" ${currentConfig.devShowDebugOutline ? 'checked' : ''} /><span>Show debug outlines</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-high-contrast-toggle" type="checkbox" ${currentConfig.devHighContrast ? 'checked' : ''} /><span>High contrast mode</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-mono-font-toggle" type="checkbox" ${currentConfig.devMonoFont ? 'checked' : ''} /><span>Monospace UI font</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-compact-player-toggle" type="checkbox" ${currentConfig.devCompactPlayer ? 'checked' : ''} /><span>Compact player bar</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-hide-header-promo-toggle" type="checkbox" ${currentConfig.devHideHeaderPromo ? 'checked' : ''} /><span>Hide header promos</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-hide-social-share-toggle" type="checkbox" ${currentConfig.devHideSocialShare ? 'checked' : ''} /><span>Hide social share UI</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-hide-badges-toggle" type="checkbox" ${currentConfig.devHideBadges ? 'checked' : ''} /><span>Hide badges</span></label>
        <label style="display:flex;gap:10px;align-items:center;margin-bottom:8px;"><input id="nutein-dev-hide-footer-links-toggle" type="checkbox" ${currentConfig.devHideFooterLinks ? 'checked' : ''} /><span>Hide footer links</span></label>
      </section>
    </div>

    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
      <button id="nutein-settings-cancel" type="button" style="padding:8px 12px;border-radius:8px;border:1px solid #555;background:#2a2d37;color:#fff;">Cancel</button>
      <button id="nutein-settings-save" type="button" style="padding:8px 12px;border-radius:8px;border:1px solid #4f7dff;background:#4f7dff;color:#fff;">Save</button>
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
    const hidePremiumMenu = modal.querySelector('#nutein-hide-premium-menu-toggle').checked;
    const hideAudiobooksMenu = modal.querySelector('#nutein-hide-audiobooks-menu-toggle').checked;
    const hideRadioMenu = modal.querySelector('#nutein-hide-radio-menu-toggle').checked;
    const hideRecentsMenu = modal.querySelector('#nutein-hide-recents-menu-toggle').checked;
    const hideMusicMenu = modal.querySelector('#nutein-hide-music-menu-toggle').checked;
    const hideSportsMenu = modal.querySelector('#nutein-hide-sports-menu-toggle').checked;
    const hideNewsMenu = modal.querySelector('#nutein-hide-news-menu-toggle').checked;
    const hidePodcastsMenu = modal.querySelector('#nutein-hide-podcasts-menu-toggle').checked;
    const hideRegionsMenu = modal.querySelector('#nutein-hide-regions-menu-toggle').checked;
    const hideLanguagesMenu = modal.querySelector('#nutein-hide-languages-menu-toggle').checked;

    const devDisableAnimations = modal.querySelector('#nutein-dev-disable-animations-toggle').checked;
    const devReduceMotion = modal.querySelector('#nutein-dev-reduce-motion-toggle').checked;
    const devShowDebugOutline = modal.querySelector('#nutein-dev-show-debug-outline-toggle').checked;
    const devHighContrast = modal.querySelector('#nutein-dev-high-contrast-toggle').checked;
    const devMonoFont = modal.querySelector('#nutein-dev-mono-font-toggle').checked;
    const devCompactPlayer = modal.querySelector('#nutein-dev-compact-player-toggle').checked;
    const devHideHeaderPromo = modal.querySelector('#nutein-dev-hide-header-promo-toggle').checked;
    const devHideSocialShare = modal.querySelector('#nutein-dev-hide-social-share-toggle').checked;
    const devHideBadges = modal.querySelector('#nutein-dev-hide-badges-toggle').checked;
    const devHideFooterLinks = modal.querySelector('#nutein-dev-hide-footer-links-toggle').checked;

    setNuteinConfig({
      tweaksEnabled,
      adsEnabled,
      disableTelemetryCrashReports,
      disableUpdates,
      hidePremiumMenu,
      hideAudiobooksMenu,
      hideRadioMenu,
      hideRecentsMenu,
      hideMusicMenu,
      hideSportsMenu,
      hideNewsMenu,
      hidePodcastsMenu,
      hideRegionsMenu,
      hideLanguagesMenu,
      devDisableAnimations,
      devReduceMotion,
      devShowDebugOutline,
      devHighContrast,
      devMonoFont,
      devCompactPlayer,
      devHideHeaderPromo,
      devHideSocialShare,
      devHideBadges,
      devHideFooterLinks,
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

  applyDevFlagsCss(config);
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
    restoreSidebarVisibilityTweaks();
    return;
  }

  injectTweaksCss();
  removeUpsellButton();
  applySidebarVisibilityTweaks(config);
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
