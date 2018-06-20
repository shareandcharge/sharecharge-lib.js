import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { ContractProvider } from "./contractProvider";
import { ToolKit } from '../utils/toolKit';

export class ChargingService {

    /**
     * Access to generic contract functions (e.g. getLogs)
     */
    public readonly contract: Contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('Charging');
    }

    /**
     * Get Charging contract address for the current stage
     */
    get address(): string {
        return this.contract.native.options.address;
    }

    /**
     * Get current charging session details for a particular EVSE
     *
     * @param scId the unique Share & Charge location identifier
     * @param evseId the EVSE of the location
     * @returns object containing controller (driver), token and price
     */
    async getSession(scId: string, evseId: string): Promise<any> {
        const session = await this.contract.call('state', scId, ToolKit.asciiToHex(evseId));
        return ToolKit.removeIndexKeys(session);
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
             * @param tariffId the enumerated value of the tariff to use (e.g. 3 if time-based)
             * @param tariffValue the quantity of the proposed charging session based on the tariff (e.g. 60 if charging for one hour on a time-based tariff)
             * @param tokenAddress the address on the network of the eMobility Service Provider token to use
             * @param estimatedPrice the estimated price of the charging session (calculated beforehand by an eMobility Service Provider based on Charge Point Operator tariff data)
             * @returns transaction object if successful
             */
            requestStart: async (scId: string, evseId: string, tariffId: number, tariffValue: number, tokenAddress: string, estimatedPrice: number) => {
                return this.contract.send("requestStart", [scId, ToolKit.asciiToHex(evseId), tariffId, tariffValue, tokenAddress, estimatedPrice], key);
            },

            /**
             * Confirm a remote start at a specific EVSE
             * @param scId the unique Share & Charge location identity string
             * @param evseId the unique identity string of the EVSE
             * @param sessionId the identifier of the session (not currently used to identify the charging session in other parts of the process)
             * @returns transaction object if successful
             */
            confirmStart: async (scId: string, evseId: string, sessionId: string) => {
                const start = Date.now() / 1000;
                return this.contract.send("confirmStart", [scId, ToolKit.asciiToHex(evseId), sessionId, start], key);
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
             * @param tariffValue the final quantity of units charged based on the chosen tariff
             * @param finalPrice the final price of the charging session (calculated by the Charge Point Operator)
             * @returns transaction object if successful
             */
            chargeDetailRecord: async (scId: string, evseId: string, tariffValue: number, finalPrice: number) => {
                const endTime = Date.now() / 1000;
                return this.contract.send("chargeDetailRecord", [scId, ToolKit.asciiToHex(evseId), finalPrice, tariffValue, endTime], key);
            },

            reset: async (scId: string, evseId: string) => {
                return this.contract.send("reset", [scId, ToolKit.asciiToHex(evseId)], key);
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
