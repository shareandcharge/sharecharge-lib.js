import { OpeningHours } from './../models/openingHours';
import { Station } from '../models/station';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { IContractProvider } from './contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../symbols';
import "reflect-metadata";
import { Key } from '../models/key';

@injectable()
export class StationService {

    private _resolved;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
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

    useWallet(wallet: Wallet, keyIndex: number = 0) {
        const key = wallet.keychain[keyIndex];
        return {
            create: this.create(key),
            update: this.update(key),
            batch: () => {
                return {
                    create: this.batchCreate(key),
                    update: this.batchUpdate(key)
                };
            }
        };
    }

    private create(key: Key) {
        return async (station: Station) => {
            station["_owner"] = key.address;
            station.tracker.resetProperties();
            const contract = await this.contract();
            return contract.send("addStation", this.toParameters(station), key);
        };
    }

    private batchCreate(key: Key) {
        return async (...stations: Station[]) => {
            const contract = await this.contract();
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const station of stations) {
                station["_owner"] = key.address;
                station.tracker.resetProperties();
                const tx = await contract.request("addStation", this.toParameters(station), key);
                batch.add(tx);
                key.nonce++;
            }
            batch.execute();
        };
    }

    private update(key: Key) {
        return async (station: Station) => {
            const contract = await this.contract();
            if (await contract.call("getIndexById", station.id) >= 0) {
                const batch = contract.newBatch();
                key.nonce = await contract.getNonce(key);
                for (const property of station.tracker.getProperties()) {
                    if (station.tracker.didPropertyChange(property)) {
                        const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                        const tx = await contract.request(funcName, [station.id, station[property]], key);
                        batch.add(tx);
                        key.nonce++;
                    }
                }
                batch.execute();
                station.tracker.resetProperties();
            }
        };
    }

    private batchUpdate(key: Key) {
        return async (...stations: Station[]) => {
            const contract = await this.contract();
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const station of stations) {
                if (await contract.call("getIndexById", station.id) >= 0) {
                    for (const property of station.tracker.getProperties()) {
                        if (station.tracker.didPropertyChange(property)) {
                            const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                            const tx = await contract.request(funcName, [station.id, station[property]], key);
                            batch.add(tx);
                            key.nonce++;
                        }
                    }
                    station.tracker.resetProperties();
                }
            }
            batch.execute();
        };
    }

    private toParameters(station: Station): any[] {
        const id = station.id;
        const lat = station.latitude * 1000000 << 0;
        const lng = station.longitude * 1000000 << 0;
        const hours = ToolKit.asciiToHex(OpeningHours.encode(station.openingHours));
        return [id, lat, lng, hours];
    }
}
