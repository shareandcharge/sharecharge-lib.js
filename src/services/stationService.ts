import * as crypto from 'crypto';
import { Station } from '../models/station';
import { Contract } from '../models/contract';
const web3Utils = require('web3').utils;

export class StationService {

    constructor(private contract: Contract) {}

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
        const result = await this.contract.call("getStation", stationId);
        return Station.deserialize(result);
    }

    async createStation(station: Station) {
        const id = station.id;
        const owner = station.owner;
        const lat = station.latitude * 1000000 << 0;
        const lng = station.longitude * 1000000 << 0;
        const hours = web3Utils.asciiToHex(station.openingHours);
        const available = station.available;
        await this.contract.send("addStation", id, owner, lat, lng, hours, available);
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

    async isPersisted(station: Station): Promise<boolean> {
        const result = await this.contract.call("getIndexById", station.id);
        return result >= 0;
    }

}
