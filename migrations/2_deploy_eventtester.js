var MyContract = artifacts.require("./EventTester.sol");

module.exports = function(deployer) {
    deployer.deploy(MyContract);
};
