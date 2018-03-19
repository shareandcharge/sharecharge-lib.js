import * as crypto from 'crypto';
import { Station } from '../models/station';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';

export class StationService {

    constructor(private contract: Contract) {}

    async getAll(): Promise<Station[]> {
        const stations: Station[] = [];
        const quantity = await this.contract.call("getNumberOfStations");
        for (let i = 0; i < quantity; i++) {
            const stationId = await this.contract.call("getIdByIndex", i);
            const station = await this.contract.call("getStation", stationId);
            stations.push(Station.deserialize(station));
        }
        return stations;
    }

    async getById(id: string): Promise<Station> {
        const result = await this.contract.call("getStation", id);
        return Station.deserialize(result);
    }

    async create(station: Station, wallet: Wallet) {
        const id = station.id;
        // const owner = station.owner;
        const lat = station.latitude * 1000000 << 0;
        const lng = station.longitude * 1000000 << 0;
        const hours = ToolKit.asciiToHex(station.openingHours);
        const available = station.available;
        await this.contract.send("addStation", wallet, id, wallet.address, lat, lng, hours, available);
    }

    async update(station: Station, wallet: Wallet) {
        await Promise.all(station.tracker.getProperties().map(async name => {
            if (station.tracker.didPropertyChange(name)) {
                const contractName = "set" + name.charAt(0).toUpperCase() + name.substr(1);
                return await this.contract.send(contractName, wallet, station.id, station[name]);
            }
        }));
        station.tracker.resetProperties();
    }

    async isPersisted(station: Station): Promise<boolean> {
        const result = await this.contract.call("getIndexById", station.id);
        return result >= 0;
    }

}
