import { Evse } from '../models/evse';
import { Contract } from "../models/contract";
import { Station } from '../models/station';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { IContractProvider } from './contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../symbols';
import "reflect-metadata";
import { Key } from '../models/key';

@injectable()
export class EvseService {

    public readonly contract;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
        this.contract = this.contractProvider.obtain('EvseStorage');
    }

    async getById(id: string): Promise<Evse> {
        const contract = this.contract;
        const result = await contract.call("getEvse", id);
        return Evse.deserialize(result);
    }

    async getByStation(station: Station): Promise<Evse[]> {
        const contract = this.contract;
        const evses: Evse[] = [];
        const evseIds = await contract.call("getStationEvses", station.id);
        for (const id of evseIds) {
            const evse = await contract.call("getEvse", id);
            evses.push(Evse.deserialize(evse));
        }
        return evses;
    }

    async anyFree(station: Station): Promise<boolean> {
        const contract = this.contract;
        const result = await contract.call("getStationAvailability", station.id);
        return result;
    }

    async isPersisted(evse: Evse): Promise<boolean> {
        const contract = this.contract;
        const result = await contract.call("getIndexById", evse.id);
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
        return async (evse: Evse) => {
            evse["_owner"] = key.address;
            evse.tracker.resetProperties();
            const contract = this.contract;
            await contract.send("addEvse", this.toParameters(evse), key);
        };
    }

    private batchCreate(key: Key) {
        return async (...evses: Evse[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const evse of evses) {
                evse["_owner"] = key.address;
                evse.tracker.resetProperties();
                const tx = await contract.request("addEvse", this.toParameters(evse), key);
                batch.add(tx);
                key.nonce++;
            }
            batch.execute();
        };
    }

    private update(key: Key) {
        return async (evse: Evse) => {
            const contract = this.contract;

            if (await contract.call("getIndexById", evse.id) >= 0) {
                const batch = contract.newBatch();
                key.nonce = await contract.getNonce(key);

                for (const property of evse.tracker.getProperties()) {
                    if (evse.tracker.didPropertyChange(property)) {
                        const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                        const tx = await contract.request(funcName, [evse.id, evse[property]], key);
                        batch.add(tx);
                        key.nonce++;
                    }
                }

                batch.execute();
                evse.tracker.resetProperties();
            }
        };
    }

    private batchUpdate(key: Key) {
        return async (...evses: Evse[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);

            for (const evse of evses) {
                if (await contract.call("getIndexById", evse.id) >= 0) {
                    for (const property of evse.tracker.getProperties()) {
                        if (evse.tracker.didPropertyChange(property)) {
                            const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                            const tx = await contract.request(funcName, [evse.id, evse[property]], key);
                            batch.add(tx);
                            key.nonce++;
                        }
                    }
                    evse.tracker.resetProperties();
                }
            }
            batch.execute();
        };
    }

    private toParameters(evse: Evse): any[] {
        const id = evse.id;
        const stationId = evse.stationId;
        const plugMask = ToolKit.toPlugMask(evse.plugTypes);
        const available = evse.available;
        return [id, stationId, plugMask, available];
    }
}
