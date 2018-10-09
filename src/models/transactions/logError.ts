import { Contract } from "../contract";
import { Key } from "../key";
import { ToolKit } from "../..";

export default class LogError {

    /**
     * The Share & Charge ID of the location
     */
    scId: string;
    private _evse: string;

    /**
     * The error code (TODO: define error codes)
     */
    code: number;

    constructor(private contract: Contract, private key: Key) {
        this.scId = '';
        this._evse = '';
        this.code = 0;
    }

    /**
     * The ID of the EVSE to be charged at
     */
    get evse(): string {
        return ToolKit.hexToString(this._evse);
    }

    set evse(id: string) {
        this._evse = ToolKit.asciiToHex(id);
    }

    /**
     * Call the respective smart contract function with the given transaction object properties
     * @returns Transaction receipt if successful or revert error message
     */
    async send(): Promise<any> {
        return this.contract.send('logError', [
            this.scId,
            this._evse,
            this.code
        ], this.key);
    }

}