import { Evse } from '../models/evse';
import { Contract } from "../models/contract";
import { Station } from '../models/station';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { ContractProvider } from './contractProvider';
import { Key } from '../models/key';

export class EvseService {

    public readonly contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('EvseStorage');
    }

    async getById(id: string): Promise<Evse> {
        const contract = this.contract;
        const result = await contract.call("getById", id);
        return Evse.deserialize(result);
    }

    async getByUid(uid: string): Promise<Evse> {
        const contract = this.contract;
        const result = await contract.call("getByUid", ToolKit.asciiToHex(uid));
        return Evse.deserialize(result);

    }

    async getByStation(station: Station): Promise<Evse[]> {
        const contract = this.contract;
        const evses: Evse[] = [];
        const evseIds = await contract.call("getIdsByStation", station.id);
        for (const id of evseIds) {
            const evse = await contract.call("getById", id);
            evses.push(Evse.deserialize(evse));
        }
        return evses;
    }

    async getSession(evse: Evse): Promise<{ controller: string, sessionPrice: number }> {
        const result = await this.contract.call("getSessionById", evse.id);
        return result;
    }

    async isAvailable(evse: Evse): Promise<boolean> {
        const result = await this.contract.call("getAvailableById", evse.id);
        return result;
    }

    async anyFree(station: Station): Promise<boolean> {
        const contract = this.contract;
        const result = await contract.call("getStationAvailability", station.id);
        return result;
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
            const contract = this.contract;
            await contract.send("create", this.toParameters(evse), key);
        };
    }

    private batchCreate(key: Key) {
        return async (...evses: Evse[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const evse of evses) {
                const tx = await contract.request("create", this.toParameters(evse), key);
                batch.add(tx);
                key.nonce++;
            }
            batch.execute();
        };
    }

    private update(key: Key) {
        return async (evse: Evse) => {
            const contract = this.contract;
            await contract.send("update", this.toParameters(evse), key);
        };
    }

    private batchUpdate(key: Key) {
        return async (...evses: Evse[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const evse of evses) {
                const tx = await contract.request("update", this.toParameters(evse), key);
                batch.add(tx);
                key.nonce++;
            }
            batch.execute();
        };
    }

    private toParameters(evse: Evse): any[] {
        const id = evse.id;
        const uid = ToolKit.asciiToHex(evse.uid);
        const stationId = evse.stationId;
        const currency = ToolKit.asciiToHex(evse.currency);
        const basePrice = evse.basePrice;
        const tariffId = evse.tariffId;
        const available = evse.available;
        return [id, uid, stationId, currency, basePrice, tariffId, available];
    }
}
