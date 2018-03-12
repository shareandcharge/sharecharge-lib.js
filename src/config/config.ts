import { ChargingStation } from "sharecharge-contracts";

export const config = {
    version: '0.1.0',
    node: 'ws://localhost:8546',
    chargeAbi: ChargingStation.abi,
    chargeAddr: ChargingStation.address,
    gasPrice: 18000000000
};