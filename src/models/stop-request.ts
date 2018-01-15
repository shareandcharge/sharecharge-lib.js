import { ChargeRequest } from './charge-request';

export class StopRequest extends ChargeRequest {

    private _event: string;

    constructor(_pole: string, _user: string /* private _measuredWatt: number = 0 */) {
        super(_pole, _user);
        this._event = 'stop';
    }

    get event(): string {
        return this._event;
    }

    // get measuredWatt(): number {
    //     return this._measuredWatt;
    // }
}