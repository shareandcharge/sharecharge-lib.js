import { ToolKit } from '../utils/toolKit';
import { ChangeTracker } from './changeTracker';
import { OpeningHours } from '..';

export class Station {

    public readonly tracker: ChangeTracker;

    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _latitude: number = 0;
    private _longitude: number = 0;
    private _openingHours: string = "0000000000000000000000000000";

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
        value = value.toLowerCase();
        if (ToolKit.isAddress(value)) {
            this.tracker.setProperty("owner", value);
        }
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
        return OpeningHours.deserialize(this._openingHours);
    }

    set openingHours(value: OpeningHours) {
        this.tracker.setProperty("openingHours", value.toString());
    }

    serialize() {
        return {
            id: this.id,
            owner: this.owner,
            latitude: this.latitude,
            longitude: this.longitude,
            openingHours: this.openingHours
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



