import { Evse } from "../models/evse";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { ContractProvider } from "./contractProvider";

export class ChargingService {

    public readonly contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('Charging');
    }

    get address(): string {
        return this.contract.native.options.address;
    }

    useWallet(wallet: Wallet, keyIndex: number = 0) {
        const key = wallet.keychain[keyIndex];
        return {
            requestStart: async (evse: Evse, tokenAddress: string, estimatedPrice: number) => {
                const contract = this.contract;
                return contract.send("requestStart", [evse.id, tokenAddress, estimatedPrice], key);
            },
            confirmStart: async (evse: Evse) => {
                const contract = this.contract;
                return contract.send("confirmStart", [evse.id], key);
            },
            requestStop: async (evse: Evse) => {
                const contract = this.contract;
                return contract.send("requestStop", [evse.id], key);
            },
            confirmStop: async (evse: Evse) => {
                const contract = this.contract;
                return contract.send("confirmStop", [evse.id], key);
            },
            chargeDetailRecord: async (evse: Evse, finalPrice: number) => {
                const contract = this.contract;
                return contract.send("chargeDetailRecord", [evse.id, finalPrice], key);
            },
            error: async (evse: Evse, errorCode: number) => {
                const contract = this.contract;
                await contract.send("logError", [evse.id, errorCode], key);
            }
        };
    }
}
