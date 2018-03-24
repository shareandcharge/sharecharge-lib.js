import { ToolKit } from '../utils/toolKit';
import { ChangeTracker } from './changeTracker';
import { OpeningHours } from './openingHours';

export class Station {

    public readonly tracker: ChangeTracker;

    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _latitude: number = 0;
    private _longitude: number = 0;
    private _openingHours: string = "0096009600960096009600960096";

    constructor() {
        this.tracker = new ChangeTracker(this);
    }

    get id(): string {
        return this._id;
    }

    get owner(): string {
        return this._owner;
    }

    get latitude(): number {
        return this._latitude;
    }

    set latitude(value: number) {
        if (value >= -90 && value <= 90) {
            this.tracker.setProperty("latitude", value);
        }
    }

    get longitude(): number {
        return this._longitude;
    }

    set longitude(value: number) {
        if (value >= -180 && value <= 180) {
            this.tracker.setProperty("longitude", value);
        }
    }

    get openingHours(): OpeningHours {
        return OpeningHours.decode(this._openingHours);
    }

    set openingHours(value: OpeningHours) {
        this.tracker.setProperty("openingHours", OpeningHours.encode(value));
    }

    static serialize(station: Station) {
        return {
            id: station._id,
            owner: station._owner,
            latitude: station._latitude,
            longitude: station._longitude,
            openingHours: station._openingHours
        };
    }

    static deserialize(payload: any): Station {
        const station = new Station();
        station._id = payload["id"];
        station._owner = payload["owner"];
        station._latitude = payload["latitude"] / 1000000;
        station._longitude = payload["longitude"] / 1000000;
        station._openingHours = ToolKit.hexToString(payload["openingHours"]);
        return station;
    }
}
