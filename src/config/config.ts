import * as ChargingStationConfiguration from './ChargingStation.json';

export const config = {
    version: '0.1.0',
    node: 'ws://localhost:8546',
    chargeAbi: ChargingStationConfiguration.abi,
    chargeAddr: ChargingStationConfiguration.address
};