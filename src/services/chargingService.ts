import { Evse } from "../models/evse";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { IContractProvider } from "./contractProvider";
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../symbols';
import "reflect-metadata";

@injectable()
export class ChargingService {

    public readonly contract;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
        this.contract = this.contractProvider.obtain('Charging');
    }

    useWallet(wallet: Wallet, keyIndex: number = 0) {
        const key = wallet.keychain[keyIndex];
        return {
            requestStart: async (evse: Evse, secondsToRent: number) => {
                const contract = this.contract;
                await contract.send("requestStart", [evse.id, secondsToRent], key);
            },
            confirmStart: async (evse: Evse, controller: string) => {
                const contract = this.contract;
                await contract.send("confirmStart", [evse.id, controller], key);
            },
            requestStop: async (evse: Evse) => {
                const contract = this.contract;
                await contract.send("requestStop", [evse.id], key);
            },
            confirmStop: async (evse: Evse, controller: string) => {
                const contract = this.contract;
                await contract.send("confirmStop", [evse.id, controller], key);
            },
            error: async (evse: Evse, controller: string, errorCode: number) => {
                const contract = this.contract;
                await contract.send("logError", [evse.id, controller, errorCode], key);
            }
        };
    }
}
