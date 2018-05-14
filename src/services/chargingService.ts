import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { ContractProvider } from "./contractProvider";
import { ToolKit } from '../utils/toolKit';

export class ChargingService {

    public readonly contract: Contract;

    /**
     * Get past logs for a specific event
     * @param eventName specify event name to get past logs for
     * @param filter object containing properties to filter by [optional]
     * @param fromBlock block number to get past logs from
     * @returns array of past event logs
     */
    public readonly getLogs: (eventName: string, filter?: {}, fromBlock?: number) => Promise<any[]>;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('Charging');
        this.getLogs = this.contract.getLogs;
    }

    /**
     * Get Charging contract address for the current stage
     */
    get address(): string {
        return this.contract.native.options.address;
    }

    /**
     * Specify a wallet to use for a transaction
     * @param wallet the Wallet object to use
     * @param keyIndex the index of the key containing the private key which will sign the transaction [default: 0]
     */
    useWallet(wallet: Wallet, keyIndex: number = 0) {
        const key = wallet.keychain[keyIndex];
        return {

            /**
             * Request a remote start at a specific EVSE
             * @param scId the unique Share & Charge location identity string
             * @param evseId the unique identity string of the EVSE
             * @param tokenAddress the address on the network of the eMobility Service Provider token to use
             * @param estimatedPrice the estimated price of the charging session (calculated beforehand by an eMobility Service Provider based on Charge Point Operator tariff data)
             * @returns transaction object if successful
             */
            requestStart: async (scId: string, evseId: string, tokenAddress: string, estimatedPrice: number) => {
                return this.contract.send("requestStart", [scId, ToolKit.asciiToHex(evseId), tokenAddress, estimatedPrice], key);
            },

            /**
             * Confirm a remote start at a specific EVSE
             * @param scId the unique Share & Charge location identity string
             * @param evseId the unique identity string of the EVSE
             * @param sessionId the identifier of the session (not currently used to identify the charging session in other parts of the process)
             * @returns transaction object if successful
             */
            confirmStart: async (scId: string, evseId: string, sessionId: string) => {
                return this.contract.send("confirmStart", [scId, ToolKit.asciiToHex(evseId), sessionId], key);
            },

            /**
             * Request a remote stop at a specific EVSE
             * @param scId the unique Share & Charge location identity string
             * @param evseId the unique identity string of the EVSE
             * @returns transaction object if successful
             */
            requestStop: async (scId: string, evseId: string) => {
                return this.contract.send("requestStop", [scId, ToolKit.asciiToHex(evseId)], key);
            },

            /**
             * Confirm a remote stop at a specific EVSE
             * @param scId the unique Share & Charge location identity string
             * @param evseId the unique identity string of the EVSE
             * @returns transaction object if successful
             */
            confirmStop: async (scId: string, evseId: string) => {
                return this.contract.send("confirmStop", [scId, ToolKit.asciiToHex(evseId)], key);
            },

            /**
             * Issue a Charge Detail Record after the completion of a session at an EVSE
             * @param scId the unique Share & Charge location identity string
             * @param evseId the unique identity string of the EVSE
             * @param finalPrice the final price of the charging session (calculated by the Charge Point Operator)
             * @returns transaction object if successful
             */
            chargeDetailRecord: async (scId: string, evseId: string, finalPrice: number) => {
                const timestamp = Date.now();
                return this.contract.send("chargeDetailRecord", [scId, ToolKit.asciiToHex(evseId), finalPrice, timestamp], key);
            },

            /**
             * Log an error that has occurred at a particular EVSE
             * @param scId the unique Share & Charge location identity string
             * @param evseId the unique identity string of the EVSE
             * @param errorCode notify the driver of a particular error (TBD - currently 0 = start error; 1 = stop error)
             */
            error: async (scId: string, evseId: string, errorCode: number) => {
                return this.contract.send("logError", [scId, ToolKit.asciiToHex(evseId), errorCode], key);
            }
        };
    }
}
