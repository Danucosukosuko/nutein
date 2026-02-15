const { ipcRenderer } = require('electron');
const transform = require('lodash/transform');
const events = require('./constants/events');
const {
  rtid,
  partnerId,
  nuteinTweaksEnabled,
  nuteinAdsEnabled,
} = require('./constants/store');
const localizationKeys = require('./constants/localizations');
const { getStore } = require('./data/store');

const attachIPCListeners = require('./attachIPCListeners');
const attachMousetrapListeners = require('./attachMousetrapListeners');

const store = getStore();

const defaultNuteinConfig = {
  tweaksEnabled: true,
  adsEnabled: false,
};

function getNuteinConfig() {
  const tweaksEnabled = store.get(nuteinTweaksEnabled);
  const adsEnabled = store.get(nuteinAdsEnabled);

  return {
    tweaksEnabled: typeof tweaksEnabled === 'boolean'
      ? tweaksEnabled
      : defaultNuteinConfig.tweaksEnabled,
    adsEnabled: typeof adsEnabled === 'boolean'
      ? adsEnabled
      : defaultNuteinConfig.adsEnabled,
  };
}

function setNuteinConfig(config) {
  store.set(nuteinTweaksEnabled, !!config.tweaksEnabled);
  store.set(nuteinAdsEnabled, !!config.adsEnabled);
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
      <span>Activar tweaks visuales (menú + ocultar prueba gratis)</span>
    </label>
    <label style="display:flex;gap:10px;align-items:center;margin-bottom:16px;">
      <input id="nutein-ads-toggle" type="checkbox" ${currentConfig.adsEnabled ? 'checked' : ''} />
      <span>Activar ADS (si está desactivado, se bloquean)</span>
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

    setNuteinConfig({ tweaksEnabled, adsEnabled });
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
  if (!config.tweaksEnabled) {
    return;
  }

  removeUpsellButton();
  injectNuteinMenuButton();
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
