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

    public readonly contract: Contract;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
        this.contract = this.contractProvider.obtain('StationStorage');
    }

    async getAll(): Promise<Station[]> {
        const contract = this.contract;
        const stations: Station[] = [];
        const quantity = await contract.call("getTotal");
        for (let i = 0; i < quantity; i++) {
            const station = await contract.call("getByIndex", i);
            stations.push(Station.deserialize(station));
        }
        return stations;
    }

    async getById(id: string): Promise<Station> {
        const contract = this.contract;
        const result = await contract.call("getById", id);
        return Station.deserialize(result);
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
            const contract = await this.contract;
            await contract.send("create", this.toParameters(station), key);
        };
    }

    private batchCreate(key: Key) {
        return async (...stations: Station[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const station of stations) {
                const tx = await contract.request("create", this.toParameters(station), key);
                batch.add(tx);
                key.nonce++;
            }
            batch.execute();
        };
    }

    private update(key: Key) {
        return async (station: Station) => {
            const contract = await this.contract;
            await contract.send("update", this.toParameters(station), key);
        };
    }

    private batchUpdate(key: Key) {
        return async (...stations: Station[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const station of stations) {
                const tx = await contract.request("update", this.toParameters(station), key);
                batch.add(tx);
                key.nonce++;
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
