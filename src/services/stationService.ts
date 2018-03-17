import * as crypto from 'crypto';
import { Station } from '../models/station';
import { Contract } from '../models/contract';
const web3Utils = require('web3').utils;

export class StationService {

    constructor(private contract: Contract) {
    }

    async getAllStations(): Promise<Station[]> {
        const stations: Station[] = [];
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

    async createStation(data: { owner: string, latitude: number, longitude: number, openingHours: string }): Promise<string> {
        const id = '0x' + crypto.randomBytes(32).toString('hex');
        const lat = data.latitude * 1000000 << 0;
        const lng = data.longitude * 1000000 << 0;
        const openingHours = web3Utils.asciiToHex(data.openingHours);
        await this.contract.send("addStation", id, data.owner, lat, lng, openingHours);
        return id;
    }

    async updateStation(station: Station) {
        await Promise.all(station.tracker.getProperties().map(async name => {
            if (station.tracker.didPropertyChange(name)) {
                const contractName = "set" + name.charAt(0).toUpperCase() + name.substr(1);
                return await this.contract.send(contractName, station.id, station[name]);
            }
        }));
        station.tracker.resetProperties();
    }

}
