const sinon = require('sinon');
const menuHelper = require('../../../app/utils/menuHelper');
const {
  togglePlayMenuId,
  backMenuId,
  forwardMenuId,
  checkForUpdatesId,
  optOutPageId,
  gdprSettingsId,
} = require('../../../app/constants/references');

describe('app/utils/menuHelper', () => {
  const menu = { getMenuItemById: sinon.stub() };
  const menuItem = {};

  before(() => {
    sinon.spy(menuHelper, 'enableMenuOption');
    sinon.spy(menuHelper, 'disableMenuOption');
  });

  describe('enableMenuOption()', () => {
    before(() => {
      menu.getMenuItemById.withArgs('validMenuItemId').returns(menuItem);
    });

    describe('when menuItem exists', () => {
      before(() => {
        menuHelper.enableMenuOption(menu, 'validMenuItemId');
      });

      after(() => {
        menuHelper.enableMenuOption.resetHistory();
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with menuItemId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly('validMenuItemId');
      });

      it('enables menuItem', () => {
        menuItem.enabled = true;
      });
    });

    describe('when menuItem does not exist', () => {
      before(() => {
        menuHelper.enableMenuOption(menu, 'invalidMenuItemId');
      });

      after(() => {
        menuHelper.enableMenuOption.resetHistory();
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with menuItemId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly('invalidMenuItemId');
      });

      it('does not enable menuItem', () => {
        (menuItem.enabled === undefined).should.be.true();
      });
    });
  });

  describe('disableMenuOption()', () => {
    before(() => {
      menu.getMenuItemById.withArgs('validMenuItemId').returns(menuItem);
    });

    describe('when menuItem exists', () => {
      before(() => {
        menuHelper.disableMenuOption(menu, 'validMenuItemId');
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with menuItemId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly('validMenuItemId');
      });

      it('disables menuItem', () => {
        menuItem.enabled = false;
      });
    });

    describe('when menuItem does not exist', () => {
      before(() => {
        menuHelper.disableMenuOption(menu, 'invalidMenuItemId');
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with menuItemId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly('invalidMenuItemId');
      });

      it('does not disable menuItem', () => {
        (menuItem.enabled === undefined).should.be.true();
      });
    });
  });

  describe('enablePlayPause()', () => {
    before(() => {
      menuHelper.enablePlayPause(menu);
    });

    after(() => {
      menuHelper.enableMenuOption.resetHistory();
    });

    it('calls enableMenuOption with menu and togglePlayMenuId', () => {
      menuHelper.enableMenuOption.should.be.calledOnce().calledWithExactly(menu, togglePlayMenuId);
    });
  });

  describe('disableMenuHistory()', () => {
    before(() => {
      menuHelper.disableMenuHistory(menu);
    });

    after(() => {
      menuHelper.disableMenuOption.resetHistory();
    });

    it('calls disableMenuOption with menu and backMenuId', () => {
      menuHelper.disableMenuOption.should.be.calledWithExactly(menu, backMenuId);
    });

    it('calls disableMenuOption with menu and forwardMenuId', () => {
      menuHelper.disableMenuOption.should.be.calledWithExactly(menu, forwardMenuId);
    });
  });

  describe('enableMenuHistory()', () => {
    before(() => {
      menuHelper.enableMenuHistory(menu);
    });

    after(() => {
      menuHelper.enableMenuOption.resetHistory();
    });

    it('calls enableMenuOption with menu and backMenuId', () => {
      menuHelper.enableMenuOption.should.be.calledWithExactly(menu, backMenuId);
    });

    it('calls enableMenuOption with menu and forwardMenuId', () => {
      menuHelper.enableMenuOption.should.be.calledWithExactly(menu, forwardMenuId);
    });
  });

  describe('enableMenuCheckForUpdates()', () => {
    before(() => {
      menuHelper.enableMenuCheckForUpdates(menu);
    });

    after(() => {
      menuHelper.enableMenuOption.resetHistory();
    });

    it('calls enableMenuOption with menu and checkForUpdatesId', () => {
      menuHelper.enableMenuOption.should.be.calledOnce().calledWithExactly(menu, checkForUpdatesId);
    });
  });

  describe('disableMenuCheckForUpdates()', () => {
    before(() => {
      menuHelper.disableMenuCheckForUpdates(menu);
    });

    after(() => {
      menuHelper.disableMenuOption.resetHistory();
    });

    it('calls disableMenuOption with menu and checkForUpdatesId', () => {
      menuHelper.disableMenuOption.should.be.calledOnce()
        .calledWithExactly(menu, checkForUpdatesId);
    });
  });

  describe('showOptOutPageMenuItem()', () => {
    before(() => {
      menu.getMenuItemById.reset();
    });

    describe('when menuItem exists', () => {
      before(() => {
        menu.getMenuItemById.withArgs(optOutPageId).returns(menuItem);
        menuHelper.showOptOutPageMenuItem(menu);
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.visible;
      });

      it('calls menu.getMenuItemById once with optOutPageId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(optOutPageId);
      });

      it('shows menuItem', () => {
        menuItem.visible = true;
      });
    });

    describe('when menuItem does not exist', () => {
      before(() => {
        menu.getMenuItemById.withArgs(optOutPageId).returns(undefined);
        menuHelper.showOptOutPageMenuItem(menu, 'invalidMenuItemId');
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with optOutPageId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(optOutPageId);
      });

      it('does not show menuItem', () => {
        (menuItem.enabled === undefined).should.be.true();
      });
    });
  });

  describe('hideOptOutPageMenuItem()', () => {
    before(() => {
      menu.getMenuItemById.reset();
    });

    describe('when menuItem exists', () => {
      before(() => {
        menu.getMenuItemById.withArgs(optOutPageId).returns(menuItem);
        menuHelper.hideOptOutPageMenuItem(menu);
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.visible;
      });

      it('calls menu.getMenuItemById once with optOutPageId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(optOutPageId);
      });

      it('hides menuItem', () => {
        menuItem.visible = false;
      });
    });

    describe('when menuItem does not exist', () => {
      before(() => {
        menu.getMenuItemById.withArgs(optOutPageId).returns(undefined);
        menuHelper.hideOptOutPageMenuItem(menu, 'invalidMenuItemId');
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with optOutPageId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(optOutPageId);
      });

      it('does not hide menuItem', () => {
        (menuItem.enabled === undefined).should.be.true();
      });
    });
  });

  describe('showGdprSettingsMenuItem()', () => {
    before(() => {
      menu.getMenuItemById.reset();
    });

    describe('when menuItem exists', () => {
      before(() => {
        menu.getMenuItemById.withArgs(gdprSettingsId).returns(menuItem);
        menuHelper.showGdprSettingsMenuItem(menu);
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.visible;
      });

      it('calls menu.getMenuItemById once with gdprSettingsId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(gdprSettingsId);
      });

      it('shows menuItem', () => {
        menuItem.visible = true;
      });
    });

    describe('when menuItem does not exist', () => {
      before(() => {
        menu.getMenuItemById.withArgs(gdprSettingsId).returns(undefined);
        menuHelper.showGdprSettingsMenuItem(menu, 'invalidMenuItemId');
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with gdprSettingsId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(gdprSettingsId);
      });

      it('does not show menuItem', () => {
        (menuItem.enabled === undefined).should.be.true();
      });
    });
  });

  describe('hideGdprSettingsMenuItem()', () => {
    before(() => {
      menu.getMenuItemById.reset();
    });

    describe('when menuItem exists', () => {
      before(() => {
        menu.getMenuItemById.withArgs(gdprSettingsId).returns(menuItem);
        menuHelper.hideGdprSettingsMenuItem(menu);
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.visible;
      });

      it('calls menu.getMenuItemById once with gdprSettingsId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(gdprSettingsId);
      });

      it('hides menuItem', () => {
        menuItem.visible = false;
      });
    });

    describe('when menuItem does not exist', () => {
      before(() => {
        menu.getMenuItemById.withArgs(gdprSettingsId).returns(undefined);
        menuHelper.hideGdprSettingsMenuItem(menu, 'invalidMenuItemId');
      });

      after(() => {
        menu.getMenuItemById.reset();
        delete menuItem.enabled;
      });

      it('calls menu.getMenuItemById once with gdprSettingsId', () => {
        menu.getMenuItemById.should.be.calledOnce().calledWithExactly(gdprSettingsId);
      });

      it('does not hide menuItem', () => {
        (menuItem.enabled === undefined).should.be.true();
      });
    });
  });
});
