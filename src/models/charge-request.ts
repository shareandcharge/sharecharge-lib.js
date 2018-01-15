export abstract class ChargeRequest {

    constructor(private _pole: string, private _user: string) { }

    get pole(): string {
        return this._pole;
    }

    get user(): string {
        return this._user;
    }
}