import { Contract } from "../contract";
import { Key } from "../key";
import { ToolKit } from "../../utils/toolKit";

export default class ChargeDetailRecord {

    /**
     * The Share & Charge ID of the location
     */
    scId: string;
    private _evse: string;

    /**
     * The final quantity of units charged (seconds or watt hours depending on tariff type)
     */
    chargedUnits: number;

    /**
     * The final price of the charge in tokens
     */
    finalPrice: number;

    constructor(private contract: Contract, private key: Key) {
        this.scId = '';
        this._evse = '';
        this.chargedUnits = 0;
        this.finalPrice = 0;
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
        const endTime = Math.round(Date.now() / 1000);
        return this.contract.send('chargeDetailRecord', [
            this.scId,
            this._evse,
            this.chargedUnits,
            this.finalPrice,
            endTime
        ], this.key);
    }

}