import { ChargeRequest } from './charge-request';

export class StopRequest extends ChargeRequest {

    constructor(_pole: string, private _measuredWatt: number = 0) {
        super(_pole);
    }

    get measuredWatt(): number {
        return this._measuredWatt;
    }
}