const sinon = require('sinon');
const omit = require('lodash/omit');
const { importWithStubs } = require('../utils/importWithStubs');
const { optOutPage, gdprSettings } = require('../../app/constants/localizations');
const {
  togglePlayMenuId,
  gdprSettingsId,
  optOutPageId,
  checkForUpdatesId,
} = require('../../app/constants/references');
const events = require('../../app/constants/events');
const { privacyPolicy, terms, help } = require('../../app/constants/externalLinks');

describe('app/createMenu', () => {
  let menu;
  const setApplicationMenuStub = sinon.stub();
  const buildFromTemplateStub = sinon.stub();
  const sendAppEventStub = sinon.stub();
  const invokeWebContentsMethodStub = sinon.stub();
  const checkForUpdatesFromMenuStub = sinon.stub();
  const geminiEventSenderStub = {
    openDevTools: sinon.stub(),
  };
  const localizatonsStub = {
    optOutPage,
    gdprSettings,
  };
  const shellStub = { openExternal: sinon.stub() };

  before(() => {
    menu = importWithStubs('/app/menu', {
      'electron-is-dev': { default: false },
      './utils/sendAppEvent': sendAppEventStub,
      electron: {
        app: sinon.stub(),
        shell: shellStub,
        Menu: {
          setApplicationMenu: setApplicationMenuStub,
          buildFromTemplate: buildFromTemplateStub,
        },
      },
      './utils/invokeWebContentsMethod': invokeWebContentsMethodStub,
      './updater': {
        checkForUpdatesFromMenu: checkForUpdatesFromMenuStub,
      },
      './utils/isMacEnvironment': () => true,
    });

    menu.initialize(geminiEventSenderStub, localizatonsStub);
  });

  describe('the custom menu template ', () => {
    let item1, item2, item3, item4, item5, item6, item7;
    let menuTemplate;

    before(() => {
      menuTemplate = menu.getMenuTemplate(geminiEventSenderStub, localizatonsStub);
      item1 = menuTemplate[0];
      item2 = menuTemplate[1];
      item3 = menuTemplate[2];
      item4 = menuTemplate[3];
      item5 = menuTemplate[4];
      item6 = menuTemplate[5];
      item7 = menuTemplate[6];
    });

    it('should have 7 root items', () => {
      menuTemplate.length.should.eql(7);
    });

    it('1st item label should eql TuneIn', () => {
      item1.label.should.eql('TuneIn');
    });

    it('TuneIn submenu length should be 3', () => {
      item1.submenu.length.should.eql(3);
    });

    describe('Edit', () => {
      it('2nd item label should eql Edit', () => {
        item2.label.should.eql('Edit');
      });

      it('Edit submenu length should be 7', () => {
        item2.submenu.length.should.eql(8);
      });

      describe('item 1', () => {
        it('contains the expected props', () => {
          omit(item2.submenu[0], 'click').should.eql({
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
          });
        });

        describe('click handler', () => {
          before(() => {
            item2.submenu[0].click();
          });

          after(() => {
            invokeWebContentsMethodStub.reset();
          });

          it('calls invokeWebContentsMethod() once with expected args', () => {
            invokeWebContentsMethodStub.should.be.calledOnce().calledWithExactly('undo');
          });
        });
      });

      describe('item 2', () => {
        it('contains the expected props', () => {
          omit(item2.submenu[1], 'click').should.eql({
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
          });
        });

        describe('click handler', () => {
          before(() => {
            item2.submenu[1].click();
          });

          after(() => {
            invokeWebContentsMethodStub.reset();
          });

          it('calls invokeWebContentsMethod() once with expected args', () => {
            invokeWebContentsMethodStub.should.be.calledOnce().calledWithExactly('redo');
          });
        });
      });

      describe('item 3', () => {
        it('contains the expected props', () => {
          item2.submenu[2].should.eql({ type: 'separator' });
        });
      });

      describe('item 4', () => {
        it('contains the expected props', () => {
          item2.submenu[3].should.eql({ accelerator: 'CmdOrCtrl+X', role: 'cut' });
        });
      });

      describe('item 5', () => {
        it('contains the expected props', () => {
          item2.submenu[4].should.eql({ accelerator: 'CmdOrCtrl+C', role: 'copy' });
        });
      });

      describe('item 6', () => {
        it('contains the expected props', () => {
          item2.submenu[5].should.eql({ accelerator: 'CmdOrCtrl+V', role: 'paste' });
        });
      });

      describe('item 7', () => {
        it('contains the expected props', () => {
          item2.submenu[6].should.eql({ accelerator: 'CmdOrCtrl+A', role: 'selectall' });
        });
      });

      describe('item 8', () => {
        it('contains the expected props', () => {
          omit(item2.submenu[7], 'click').should.eql({
            label: 'Search',
            accelerator: 'CmdOrCtrl+L',
          });
        });

        describe('click handler', () => {
          before(() => {
            item2.submenu[7].click();
          });

          after(() => {
            sendAppEventStub.reset();
          });

          it('calls invokeWebContentsMethod() once with expected args', () => {
            sendAppEventStub.should.be.calledOnce().calledWithExactly(events.search);
          });
        });
      });
    });

    it('3rd item label should eql History', () => {
      item3.label.should.eql('History');
    });

    it('History submenu length should be 2', () => {
      item3.submenu.length.should.eql(2);
    });

    it('4th item label should eql View', () => {
      item4.label.should.eql('View');
    });

    describe('View submenu', () => {
      it('length should be 9', () => {
        item4.submenu.length.should.eql(9); // if isDev = true then 9
      });

      describe('item 0', () => {
        it('contains the expected props', () => {
          omit(item4.submenu[0], 'click').should.eql({
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
          });
        });

        describe('click handler', () => {
          before(() => {
            item4.submenu[0].click();
          });

          after(() => {
            invokeWebContentsMethodStub.reset();
          });

          it('calls invokeWebContentsMethod() once with expected args', () => {
            invokeWebContentsMethodStub.should.be.calledOnce().calledWithExactly('reload');
          });
        });
      });

      describe('item 1', () => {
        it('contains the expected props', () => {
          item4.submenu[1].should.match({ role: 'forcereload' });
        });
      });

      describe('item 2', () => {
        it('contains the expected props', () => {
          item4.submenu[2].should.match({ type: 'separator' });
        });
      });

      describe('item 3', () => {
        it('contains the expected props', () => {
          item4.submenu[3].should.match({ role: 'resetzoom' });
        });
      });

      describe('item 4', () => {
        it('contains the expected props', () => {
          item4.submenu[4].should.match({ role: 'zoomin' });
        });
      });

      describe('item 5', () => {
        it('contains the expected props', () => {
          item4.submenu[5].should.match({ role: 'zoomout' });
        });
      });

      describe('item 6', () => {
        it('contains the expected props', () => {
          item4.submenu[6].should.match({ type: 'separator' });
        });
      });

      describe('item 7', () => {
        it('contains the expected props', () => {
          item4.submenu[7].should.match({ role: 'togglefullscreen' });
        });
      });

      describe('item 8', () => {
        it('contains the expected props', () => {
          item4.submenu[8].should.match({
            label: 'Open Web Console',
            click: () => {},
          });
        });

        it('invokes the expected methods when click() is called', () => {
          item4.submenu[8].click();
          geminiEventSenderStub.openDevTools.should.be.calledOnce();
        });
      });
    });

    it('5th item label should not have a custom label', () => {
      (item5.label === undefined).should.be.true();
    });

    it('Window submenu length should be 3', () => {
      item5.submenu.length.should.eql(3);
    });

    describe('Playback', () => {
      it('6th item label should eql Playback', () => {
        item6.label.should.eql('Playback');
      });

      it('Playback submenu length should be 1', () => {
        item6.submenu.length.should.eql(3);
      });

      describe('item 1', () => {
        it('contains the expected props', () => {
          omit(item6.submenu[0], 'click').should.eql({
            label: 'Toggle Play',
            id: togglePlayMenuId,
            enabled: false,
          });
        });

        describe('click handler', () => {
          before(() => {
            item6.submenu[0].click();
          });

          after(() => {
            invokeWebContentsMethodStub.reset();
          });

          it('calls invokeWebContentsMethod() once with expected args', () => {
            invokeWebContentsMethodStub.should.be.calledOnce().calledWithExactly('send', events.playToggle);
          });
        });
      });

      describe('item 2', () => {
        it('contains the expected props', () => {
          omit(item6.submenu[1], 'click').should.eql({
            label: 'Volume Up',
            accelerator: 'CmdOrCtrl+Up',
          });
        });

        describe('click handler', () => {
          before(() => {
            item6.submenu[1].click();
          });

          after(() => {
            sendAppEventStub.reset();
          });

          it('calls invokeWebContentsMethod() once with expected args', () => {
            sendAppEventStub.should.be.calledOnce().calledWithExactly(events.volumeUp);
          });
        });
      });

      describe('item 3', () => {
        it('contains the expected props', () => {
          omit(item6.submenu[2], 'click').should.eql({
            label: 'Volume Down',
            accelerator: 'CmdOrCtrl+Down',
          });
        });

        describe('click handler', () => {
          before(() => {
            item6.submenu[2].click();
          });

          after(() => {
            sendAppEventStub.reset();
          });

          it('calls invokeWebContentsMethod() once with expected args', () => {
            sendAppEventStub.should.be.calledOnce().calledWithExactly(events.volumeDown);
          });
        });
      });
    });

    describe('Help', () => {
      // trailing space prevents the search from being added to a regular help menu
      it('7th item label should eql `Help `', () => {
        item7.label.should.eql('Help ');
      });

      it('Help submenu length should be 6', () => {
        item7.submenu.length.should.eql(6);
      });

      describe('item 1', () => {
        it('contains the expected props', () => {
          omit(item7.submenu[0], 'click').should.eql({
            label: 'Privacy Policy',
          });
        });

        describe('click handler', () => {
          before(() => {
            item7.submenu[0].click();
          });

          after(() => {
            shellStub.openExternal.reset();
          });

          it('calls shell.openExternal() once with expected args', () => {
            shellStub.openExternal.should.be.calledOnce().calledWithExactly(privacyPolicy);
          });
        });
      });

      describe('item 2', () => {
        it('contains the expected props', () => {
          omit(item7.submenu[1], 'click').should.eql({
            label: 'Terms',
          });
        });

        describe('click handler', () => {
          before(() => {
            item7.submenu[1].click();
          });

          after(() => {
            shellStub.openExternal.reset();
          });

          it('calls shell.openExternal() once with expected args', () => {
            shellStub.openExternal.should.be.calledOnce().calledWithExactly(terms);
          });
        });
      });

      describe('item 3', () => {
        it('contains the expected props', () => {
          omit(item7.submenu[2], 'click').should.eql({
            label: 'Help',
          });
        });

        describe('click handler', () => {
          before(() => {
            item7.submenu[2].click();
          });

          after(() => {
            shellStub.openExternal.reset();
          });

          it('calls shell.openExternal() once with expected args', () => {
            shellStub.openExternal.should.be.calledOnce().calledWithExactly(help);
          });
        });
      });

      describe('item 4', () => {
        it('contains the expected props', () => {
          omit(item7.submenu[3], 'click').should.eql({
            label: localizatonsStub[optOutPage],
            id: optOutPageId,
            visible: false,
          });
        });

        describe('click handler', () => {
          before(() => {
            item7.submenu[3].click();
          });

          after(() => {
            sendAppEventStub.reset();
          });

          it('calls sendAppEvent() once with expected args', () => {
            sendAppEventStub.should.be.calledOnce().calledWithExactly(events.navigateToOptOutPage);
          });
        });
      });

      describe('item 5', () => {
        it('contains the expected props', () => {
          omit(item7.submenu[4], 'click').should.eql({
            label: localizatonsStub[gdprSettings],
            id: gdprSettingsId,
            visible: false,
          });
        });

        describe('click handler', () => {
          before(() => {
            item7.submenu[4].click();
          });

          after(() => {
            sendAppEventStub.reset();
          });

          it('calls sendAppEvent() once with expected args', () => {
            sendAppEventStub.should.be.calledOnce().calledWithExactly(events.openGdprSettings);
          });
        });
      });

      describe('item 6', () => {
        it('contains the expected props', () => {
          omit(item7.submenu[5], 'click').should.eql({
            label: 'Check For Updates',
            id: checkForUpdatesId,
          });
        });

        describe('click handler', () => {
          before(() => {
            item7.submenu[5].click();
          });

          after(() => {
            checkForUpdatesFromMenuStub.reset();
          });

          it('calls checkForUpdatesFromMenu() once with expected args', () => {
            checkForUpdatesFromMenuStub.should.be.calledOnce();
          });
        });
      });
    });
  });
});
