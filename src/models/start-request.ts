import { ChargeRequest } from './charge-request';

export class StartRequest extends ChargeRequest {

    private _event: string;

    constructor(_pole: string, _user: string /* private _wattPower: number = 0, private _secondsToRent: number = 0 */) {
        super(_pole, _user);
        this._event = 'start';
    }

    get event(): string {
        return this._event;
    }

    // get wattPower(): number {
    //     return this._wattPower;
    // }

    // get secondsToRent(): number {
    //     return this._secondsToRent;
    // }
}