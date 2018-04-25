import { Evse } from "../models/evse";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { ContractProvider } from "./contractProvider";

export class ChargingService {

    public readonly contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('Charging');
    }

    useWallet(wallet: Wallet, keyIndex: number = 0) {
        const key = wallet.keychain[keyIndex];
        return {
            requestStart: async (evse: Evse, estimatedPrice: number) => {
                const contract = this.contract;
                await contract.send("requestStart", [evse.id, estimatedPrice], key);
            },
            confirmStart: async (evse: Evse) => {
                const contract = this.contract;
                await contract.send("confirmStart", [evse.id], key);
            },
            requestStop: async (evse: Evse) => {
                const contract = this.contract;
                await contract.send("requestStop", [evse.id], key);
            },
            confirmStop: async (evse: Evse, startTime: number, stopTime: number, totalEnergy: number) => {
                const contract = this.contract;
                await contract.send("confirmStop", [evse.id, startTime, stopTime, totalEnergy], key);
            },
            error: async (evse: Evse, errorCode: number) => {
                const contract = this.contract;
                await contract.send("logError", [evse.id, errorCode], key);
            }
        };
    }
}
