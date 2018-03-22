import { OpeningHours } from './../models/openingHours';
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
                const hours = ToolKit.asciiToHex(OpeningHours.encode(station.openingHours));
                station.tracker.resetProperties();
                return contract.send("addStation", [id, wallet.address, lat, lng, hours], wallet);
            },
            createBatch: async (...stations: Station[]) => {
                const contract = await this.contract();
                const batch = contract.newBatch();
                wallet.nonce = await contract.getNonce(wallet);
                for (const station of stations) {
                    const id = station.id;
                    const lat = station.latitude * 1000000 << 0;
                    const lng = station.longitude * 1000000 << 0;
                    const hours = ToolKit.asciiToHex(OpeningHours.encode(station.openingHours));
                    const tx = await contract.request("addStation", [id, wallet.address, lat, lng, hours], wallet);
                    batch.add(tx);
                    wallet.nonce++;
                }
                batch.execute();
            },
            update: async (station: Station) => {
                const contract = await this.contract();
                if (await contract.call("getIndexById", station.id) >= 0) {
                    const batch = contract.newBatch();
                    wallet.nonce = await contract.getNonce(wallet);
                    for (const property of station.tracker.getProperties()) {
                        if (station.tracker.didPropertyChange(property)) {
                            const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                            const tx = await contract.request(funcName, [station.id, station[property]], wallet);
                            batch.add(tx);
                            wallet.nonce++;
                        }
                    }
                    station.tracker.resetProperties();
                    batch.execute();
                }
            },
            updateBatch: async (...stations: Station[]) => {
                const contract = await this.contract();
                const batch = contract.newBatch();
                wallet.nonce = await contract.getNonce(wallet);
                for (const station of stations) {
                    if (await contract.call("getIndexById", station.id) >= 0) {
                        const batch = contract.newBatch();
                        wallet.nonce = await contract.getNonce(wallet);
                        for (const property of station.tracker.getProperties()) {
                            if (station.tracker.didPropertyChange(property)) {
                                const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                                const tx = await contract.request(funcName, [station.id, station[property]], wallet);
                                batch.add(tx);
                                wallet.nonce++;
                            }
                        }
                        station.tracker.resetProperties();
                    }
                }
                batch.execute();
            }
        };
    }
}
