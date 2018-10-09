import { ToolKit } from '../../utils/toolKit';
import { Contract } from '../contract';
import { Key } from '../key';

export default class Stop {

    /**
     * The Share & Charge ID of the location
     */
    scId: string;
    private _evse: string;

    constructor(private method: string, private contract: Contract, private key: Key) {
        this.scId = '';
        this._evse = '';
    }

    /**
     * The ID of the EVSE to be charged at
     */
    set evse(id: string) {
        this._evse = ToolKit.asciiToHex(id);
    }

    get evse(): string {
        return ToolKit.hexToString(this._evse);
    }

    async send() {
        await this.contract.send(
            this.method,
            [this.scId, this._evse],
            this.key
        );
    }
}