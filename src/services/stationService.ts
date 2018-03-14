import * as crypto from 'crypto';
import { Station } from './../models/station';
import { Contract } from './contract';
import { Wallet } from './wallet';
const web3Utils = require('web3').utils;

export class StationService {

    constructor(private contract: Contract, private wallet: Wallet) {
    }

    async getAllStations(): Promise<Station[]> {
        const stations = new Array();
        const quantity = await this.contract.call("getNumberOfStations");
        for (let i = 0; i < quantity; i++) {
            const stationId = await this.contract.call("getIdByIndex", i);
            const station = await this.contract.call("getStation", stationId);
            stations.push(Station.deserialize(station));
        }
        return stations;
    }

    async getStation(stationId: string): Promise<Station> {
        const stationOnContract = await this.contract.call("getStation", stationId);
        return Station.deserialize(stationOnContract);
    }

    async createStation(data: { latitude: number, longitude: number, openingHours: string }): Promise<string> {
        const id = '0x' + crypto.randomBytes(32).toString('hex');
        const owner = this.wallet.address;
        const lat = data.latitude * 1000000 << 0;
        const lng = data.longitude * 1000000 << 0;
        const openingHours = web3Utils.asciiToHex(data.openingHours);
        await this.contract.send(owner, "addStation", id, owner, lat, lng, openingHours);
        return id;
    }

    updateStation(station: Station) {
        const changedFields = station.changedFields();
        station.resetFieldChanges();
    }

}
