export abstract class ChargeRequest {

    constructor(private _pole: string) { }

    get pole(): string {
        return this._pole;
    }
}