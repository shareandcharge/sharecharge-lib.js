import { Contract } from "../contract";
import { ToolKit } from "../../utils/toolKit";
import { Key } from "../key";

export default class ConfirmStart {

    /**
     * The Share & Charge ID of the location
     */
    scId: string;
    private _evse: string;

    /**
     * The identifier of the charging session
     */
    sessionId: string;

    constructor(private contract: Contract, private key: Key) {
        this.scId = '';
        this._evse = '';
        this.sessionId = '';
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
        const startTime = Math.round(Date.now() / 1000);
        await this.contract.send('confirmStart', [
            this.scId,
            this._evse,
            this.sessionId,
            startTime
        ], this.key);

    }
}