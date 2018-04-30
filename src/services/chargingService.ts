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
            requestStart: async (scId: string, evseId: string, tokenAddress: string, estimatedPrice: number) => {
                return this.contract.send("requestStart", [scId, evseId, tokenAddress, estimatedPrice], key);
            },
            confirmStart: async (scId: string, evseId: string, sessionId: string) => {
                return this.contract.send("confirmStart", [scId, evseId, sessionId], key);
            },
            requestStop: async (scId: string, evseId: string) => {
                return this.contract.send("requestStop", [scId, evseId], key);
            },
            confirmStop: async (scId: string, evseId: string) => {
                return this.contract.send("confirmStop", [scId, evseId], key);
            },
            chargeDetailRecord: async (scId: string, evseId: string, finalPrice: number) => {
                const timestamp = Date.now();
                return this.contract.send("chargeDetailRecord", [scId, evseId, finalPrice, timestamp], key);
            },
            error: async (scId: string, evseId: string, errorCode: number) => {
                return this.contract.send("logError", [scId, evseId, errorCode], key);
            }
        };
    }
}
