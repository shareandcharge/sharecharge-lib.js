import { ChargeRequest } from './charge-request';

export class StartRequest extends ChargeRequest {

    constructor(_pole: string, private _wattPower: number = 0, private _secondsToRent: number = 0) {
        super(_pole);
    }

    get wattPower(): number {
        return this._wattPower;
    }

    get secondsToRent(): number {
        return this._secondsToRent;
    }
}