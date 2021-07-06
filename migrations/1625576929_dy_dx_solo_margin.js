const DyDxSoloMargin = artifacts.require('DyDxSoloMargin');

module.exports = function(_deployer) {
  _deployer.deploy(DyDxSoloMargin);
};
