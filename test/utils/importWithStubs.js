const proxyquire = require('proxyquire');
const mockery = require('mockery');
const rewire = require('rewire');
const forEach = require('lodash/forEach');
const appRootPath = require('app-root-path');

function absolutePath(path) {
  return appRootPath.path + path;
}

function importWithStubs(srcRelativePath, stubs) {
  const path = absolutePath(srcRelativePath);
  return proxyquire.noCallThru().load(path, stubs);
}

function resetRewire() {
  mockery.disable();
  mockery.deregisterAll();
}

function rewireWithStubs(srcRelativePath, stubs) {
  const srcPath = absolutePath(srcRelativePath);

  resetRewire();

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
  });

  forEach(stubs, (stub, path) => mockery.registerMock(path, stub));
  return rewire(srcPath);
}


module.exports = {
  importWithStubs,
  rewireWithStubs,
  resetRewire,
};
