import { ChangeTracker } from './changeTracker';
const web3Utils = require('web3').utils;

export class Station {

    public readonly tracker: ChangeTracker;

    private _id: string = "";
    private _owner: string = "";
    private _latitude: number = 0;
    private _longitude: number = 0;
    private _openingHours: string = "";
    private _enabled: boolean = true;

    constructor() {
        this.tracker = new ChangeTracker(this);
    }

    get id(): string {
        return this._id;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        this.tracker.setProperty("owner", value);
    }

    get latitude(): number {
        return this._latitude;
    }

    set latitude(value: number) {
        this.tracker.setProperty("latitude", value);
    }

    get longitude(): number {
        return this._longitude;
    }

    set longitude(value: number) {
        this.tracker.setProperty("longitude", value);
    }

    get openingHours(): string {
        return this._openingHours;
    }

    set openingHours(value: string) {
        this.tracker.setProperty("openingHours", value);
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this.tracker.setProperty("enabled", value);
    }

    static serialize(station: Station): any {
        return {
            id: station._id,
            owner: station._owner,
            latitude: station._latitude,
            longitude: station._longitude,
            openingHours: station._openingHours,
            enabled: station._enabled
        }
    }

    static deserialize(payload: any): Station {
        const station = new Station();
        station._id = payload["id"];
        station._owner = payload["owner"];
        station._latitude = payload["latitude"] / 1000000;
        station._longitude = payload["longitude"] / 1000000;
        station._openingHours = web3Utils.hexToString(payload["openingHours"]);
        station._enabled = payload["enabled"];
        return station;
    }
}



