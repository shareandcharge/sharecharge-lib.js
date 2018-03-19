import * as crypto from 'crypto';
import { Station } from '../models/station';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';

export class StationService {

    constructor(private contract: Contract, private wallet: Wallet) {}

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
        const hours = ToolKit.asciiToHex(station.openingHours);
        const available = station.available;
        await this.contract.send("addStation", this.wallet, id, owner, lat, lng, hours, available);
    }

    async updateStation(station: Station) {
        await Promise.all(station.tracker.getProperties().map(async name => {
            if (station.tracker.didPropertyChange(name)) {
                const contractName = "set" + name.charAt(0).toUpperCase() + name.substr(1);
                return await this.contract.send(contractName, this.wallet, station.id, station[name]);
            }
        }));
        station.tracker.resetProperties();
    }

    async isPersisted(station: Station): Promise<boolean> {
        const result = await this.contract.call("getIndexById", station.id);
        return result >= 0;
    }

}
