import { ToolKit } from './toolKit';
import { ChangeTracker } from './changeTracker';

export class Station {

    public readonly tracker: ChangeTracker;

    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _latitude: number = 0;
    private _longitude: number = 0;
    private _openingHours: string = "00000000000000000000000000000000";
    private _available: boolean = true;

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

    get available(): boolean {
        return this._available;
    }

    set available(value: boolean) {
        this.tracker.setProperty("available", value);
    }

    static serialize(station: Station): any {
        return {
            id: station._id,
            owner: station._owner,
            latitude: station._latitude,
            longitude: station._longitude,
            openingHours: station._openingHours,
            available: station._available
        }
    }

    static deserialize(payload: any): Station {
        const station = new Station();
        station._id = payload["id"];
        station._owner = payload["owner"];
        station._latitude = payload["latitude"] / 1000000;
        station._longitude = payload["longitude"] / 1000000;
        station._openingHours = ToolKit.hexToString(payload["openingHours"]);
        station._available = payload["available"];
        return station;
    }
}



