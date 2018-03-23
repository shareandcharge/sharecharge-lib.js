import { Evse } from "../models/evse";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { IContractProvider } from "./contractProvider";
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../models/symbols';
import "reflect-metadata";

@injectable()
export class ChargingService {

    private _resolved;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
    }

    async contract(): Promise<Contract> {
        this._resolved = this._resolved || await this.contractProvider.obtain('Charging');
        return this._resolved;
    }

    useWallet(wallet: Wallet) {
        return {
            requestStart: async (evse: Evse, secondsToRent: number) => {
                const contract = await this.contract();
                await contract.send("requestStart", [evse.id, secondsToRent], wallet);
            },
            confirmStart: async (evse: Evse, controller: string) => {
                const contract = await this.contract();
                await contract.send("confirmStart", [evse.id, controller], wallet);
            },
            requestStop: async (evse: Evse) => {
                const contract = await this.contract();
                await contract.send("requestStop", [evse.id], wallet);
            },
            confirmStop: async (evse: Evse, controller: string) => {
                const contract = await this.contract();
                await contract.send("confirmStop", [evse.id, controller], wallet);
            },
            error: async (evse: Evse, controller: string, errorCode: number) => {
                const contract = await this.contract();
                await contract.send("logError", [evse.id, controller, errorCode], wallet);
            }
        };
    }
}
