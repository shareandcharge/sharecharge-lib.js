import { Evse } from '../models/evse';
import { Contract } from "../models/contract";
import { Station } from '../models/station';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { IContractProvider } from './contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../models/symbols';
import "reflect-metadata";

@injectable()
export class EvseService {

    private _resolved;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
    }

    async contract(): Promise<Contract> {
        this._resolved = this._resolved || await this.contractProvider.obtain('EvseStorage');
        return this._resolved;
    }

    async getById(id: string): Promise<Evse> {
        const contract = await this.contract();
        const result = await contract.call("getEvse", id);
        return Evse.deserialize(result);
    }

    async getByStation(station: Station): Promise<Evse[]> {
        const contract = await this.contract();
        const evses: Evse[] = [];
        const evseIds = await contract.call("getStationEvses", station.id);
        for (const id of evseIds) {
            const evse = await contract.call("getEvse", id);
            evses.push(Evse.deserialize(evse));
        }
        return evses;
    }

    async anyFree(station: Station): Promise<boolean> {
        const contract = await this.contract();
        const result = await contract.call("getStationAvailability", station.id);
        return result;
    }

    async isPersisted(evse: Evse): Promise<boolean> {
        const contract = await this.contract();
        const result = await contract.call("getIndexById", evse.id);
        return result >= 0;
    }

    useWallet(wallet: Wallet) {
        return {
            create: async (evse: Evse) => {
                const contract = await this.contract();
                const id = evse.id;
                const owner = evse.owner = wallet.address;
                const stationId = evse.stationId;
                const plugMask = ToolKit.toPlugMask(evse.plugTypes);
                const available = evse.available;
                await contract.send("addEvse", [id, owner, stationId, plugMask, available], wallet);
            },
            createBatch: async (...evses: Evse[]) => {
                const contract = await this.contract();
                const batch = contract.newBatch();
                wallet.nonce = await contract.getNonce(wallet);
                for (const evse of evses) {
                    const parameters = [
                        evse.id,
                        wallet.address,
                        evse.stationId,
                        ToolKit.toPlugMask(evse.plugTypes),
                        evse.available
                    ];
                    const tx = await contract.request("addEvse", parameters, wallet);
                    batch.add(tx);
                    wallet.nonce++;
                }
                batch.execute();
            },
            update: async (evse: Evse) => {
                const contract = await this.contract();

                if (await contract.call("getIndexById", evse.id) >= 0) {
                    const batch = contract.newBatch();
                    wallet.nonce = await contract.getNonce(wallet);

                    for (const property of evse.tracker.getProperties()) {
                        if (evse.tracker.didPropertyChange(property)) {
                            const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                            const tx = await contract.request(funcName, [evse.id, evse[property]], wallet);
                            batch.add(tx);
                            wallet.nonce++;
                        }
                    }

                    batch.execute();
                    evse.tracker.resetProperties();
                }
            },
            updateBatch: async (...evses: Evse[]) => {
                const contract = await this.contract();
                const batch = contract.newBatch();
                wallet.nonce = await contract.getNonce(wallet);

                for (const evse of evses) {
                    if (await contract.call("getIndexById", evse.id) >= 0) {
                        for (const property of evse.tracker.getProperties()) {
                            if (evse.tracker.didPropertyChange(property)) {
                                const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                                const tx = await contract.request(funcName, [evse.id, evse[property]], wallet);
                                batch.add(tx);
                                wallet.nonce++;
                            }
                        }
                        evse.tracker.resetProperties();
                    }
                }
                batch.execute();
            }
        };
    }
}
