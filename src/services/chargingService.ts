import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { ContractProvider } from "./contractProvider";
import { ToolKit } from '../utils/toolKit';
import RequestStart from '../models/transactions/requestStart';
import ConfirmStart from "../models/transactions/confirmStart";
import Stop from "../models/transactions/stop";
import ChargeDetailRecord from "../models/transactions/chargeDetailRecord";
import LogError from "../models/transactions/logError";

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
             * Request a remote start at a specific location
             * @returns RequestStart transaction object
             */
            requestStart: () => {
                return new RequestStart(this.contract, key);
            },

            /**
             * Confirm a remote start at a specific location
             * @returns ConfirmStart transaction object
             */
            confirmStart: () => {
                return new ConfirmStart(this.contract, key);
            },

            /**
             * Request a remote stop at a specific location
             * @returns Stop transaction object
             */
            requestStop: () => {
                return new Stop('requestStop', this.contract, key);
            },

            /**
             * Confirm a remote stop at a specific location
             * @returns Stop transaction object
             */
            confirmStop: () => {
                return new Stop('confirmStop', this.contract, key);
            },

            /**
             * Issue a Charge Detail Record after the completion of a session at a location
             * @returns ChargeDetailRecord transaction object
             */
            chargeDetailRecord: () => {
                return new ChargeDetailRecord(this.contract, key);
            },

            /**
             * Log an error that has occurred at a particular location
             * @returns LogError transaction object
             */
            logError: () => {
                return new LogError(this.contract, key);
            }
        };
    }
}
