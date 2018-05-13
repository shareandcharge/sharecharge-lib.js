import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { ContractProvider } from "./contractProvider";
import { ToolKit } from '../utils/toolKit';

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
                return this.contract.send("requestStart", [scId, ToolKit.asciiToHex(evseId), tokenAddress, estimatedPrice], key);
            },
            confirmStart: async (scId: string, evseId: string, sessionId: string) => {
                return this.contract.send("confirmStart", [scId, ToolKit.asciiToHex(evseId), sessionId], key);
            },
            requestStop: async (scId: string, evseId: string) => {
                return this.contract.send("requestStop", [scId, ToolKit.asciiToHex(evseId)], key);
            },
            confirmStop: async (scId: string, evseId: string) => {
                return this.contract.send("confirmStop", [scId, ToolKit.asciiToHex(evseId)], key);
            },
            chargeDetailRecord: async (scId: string, evseId: string, finalPrice: number) => {
                const timestamp = Date.now();
                return this.contract.send("chargeDetailRecord", [scId, ToolKit.asciiToHex(evseId), finalPrice, timestamp], key);
            },
            error: async (scId: string, evseId: string, errorCode: number) => {
                return this.contract.send("logError", [scId, ToolKit.asciiToHex(evseId), errorCode], key);
            }
        };
    }
}
