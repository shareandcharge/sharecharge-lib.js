import { ToolKit } from "../../utils/toolKit";
import { Contract } from "../contract";
import { Key } from "../key";

enum TariffEnum {
    'ENERGY' = 0,
    'FLAT' = 1,
    'TIME' = 3
}

type Tariff = 'ENERGY' | 'FLAT' | 'TIME';

export default class RequestStart {

    /**
     * The Share & Charge ID of the location
     */
    scId: string;

    private _evse: string;
    private _connector: string;
    private _tariff: 0 | 1 | 3;
    /**
     * The quantity of the charging session: seconds if "time" or "flat" tariff; watt hours if "energy"
     */
    chargeUnits: number;
    /**
     * The address of the MSP token to pay for the charging session
     */
    tokenAddress: string;
    /**
     * The estimated price of the charging session, as calculated by the tariff Id
     */
    estimatedPrice: number;

    constructor(private contract: Contract, private key: Key) {
        this.scId = '';
        this._evse = '';
        this._connector = '';
        this._tariff = 0;
        this.chargeUnits = 0;
        this.tokenAddress = '';
        this.estimatedPrice = 0;
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
     * The connector of the EVSE to charge at
     */
    get connector(): string {
        return ToolKit.hexToString(this._connector);
    }

    set connector(id: string) {
        this._connector = ToolKit.asciiToHex(id);
    }

    /**
     * The type of tariff to be used: one of "energy", "flat", or "time"
     */
    get tariff(): Tariff {
        const tariff = <Tariff>TariffEnum[this._tariff];
        return tariff;
    }

    set tariff(type: Tariff) {
        this._tariff = TariffEnum[type];
        if (this._tariff === undefined) {
            throw Error('Invalid tariff: should be one of "energy", "flat" or "time"');
        }
    }

    /**
     * Call the respective smart contract function with the given transaction object properties
     * @returns Transaction receipt if successful or revert error message
     */
    async send(): Promise<any> {
        await this.contract.send("requestStart", [
            this.scId,
            this._evse,
            this._connector,
            this._tariff,
            this.chargeUnits,
            this.tokenAddress,
            this.estimatedPrice
        ], this.key);
    }

}

