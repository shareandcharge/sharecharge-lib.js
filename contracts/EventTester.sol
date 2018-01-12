pragma solidity ^0.4.17;

contract EventTester {
    event Start(bytes32 indexed _pole, uint indexed _wattPower, uint indexed _secondsToRent);
    event Stop(bytes32 indexed _pole, uint indexed _measuredWatt);

    function start() public {
        Start(0x01, 11000, 3600);
    }

    function stop() public {
        Stop(0x01, 5000);
    }
}
