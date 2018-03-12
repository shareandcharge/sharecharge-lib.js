let ChargingStationConfiguration;

try {
    ChargingStationConfiguration = require('./ChargingStation.json');
} catch (err) {
    console.log('WARNING: No ChargingStation.json');
    ChargingStationConfiguration = {
        abi: [],
        address: '0x547de1b5914a4b194df58f5818daabee76125e75'
    };
}

export const config = {
    version: '0.1.0',
    node: 'ws://localhost:8546',
    chargeAbi: ChargingStationConfiguration.abi,
    chargeAddr: ChargingStationConfiguration.address,
    gasPrice: 18000000000
};