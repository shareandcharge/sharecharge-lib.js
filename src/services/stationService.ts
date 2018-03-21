import { Station } from '../models/station';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { IContractProvider } from './contractProvider';

export class StationService {

    private _resolved;

    constructor(private contractProvider: IContractProvider) {
    }

    async contract(): Promise<Contract> {
        this._resolved = this._resolved || await this.contractProvider.obtain('StationStorage');
        return this._resolved;
    }

    async getAll(): Promise<Station[]> {
        const contract = await this.contract();
        const stations: Station[] = [];
        const quantity = await contract.call("getNumberOfStations");
        for (let i = 0; i < quantity; i++) {
            const stationId = await contract.call("getIdByIndex", i);
            const station = await contract.call("getStation", stationId);
            stations.push(Station.deserialize(station));
        }
        return stations;
    }

    async getById(id: string): Promise<Station> {
        const contract = await this.contract();
        const result = await contract.call("getStation", id);
        return Station.deserialize(result);
    }

    async isPersisted(station: Station): Promise<boolean> {
        const contract = await this.contract();
        const result = await contract.call("getIndexById", station.id);
        return result >= 0;
    }

    useWallet(wallet: Wallet) {
        return {
            create: async (station: Station) => {
                const contract = await this.contract();
                const id = station.id;
                const lat = station.latitude * 1000000 << 0;
                const lng = station.longitude * 1000000 << 0;
                const hours = ToolKit.asciiToHex(station.openingHours.toString());
                await contract.send("addStation", wallet, id, wallet.address, lat, lng, hours);
                station.tracker.resetProperties();
            },
            update: async (station: Station) => {
                const contract = await this.contract();
                if (await contract.call("getIndexById", station.id) >= 0) {
                    await Promise.all(station.tracker.getProperties().map(async name => {
                        if (station.tracker.didPropertyChange(name)) {
                            const contractName = "set" + name.charAt(0).toUpperCase() + name.substr(1);
                            return await contract.send(contractName, wallet, station.id, station[name]);
                        }
                    }));
                    station.tracker.resetProperties();
                }
            }
        };
    }
}
