const web3Utils = require('web3').utils;

export class Station {
    private _fieldChange: object = {};

    private _id: string = "";
    private _owner: string = "";
    private _latitude: number = 0;
    private _longitude: number = 0;
    private _openingHours: string = "";

    get id(): string {
        return this._id;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        if (value != this._owner) {
            this._fieldChange["owner"] = true;
            this._owner = value;
        }
    }

    get latitude(): number {
        return this._latitude;
    }

    set latitude(value: number) {
        if (value != this._latitude) {
            this._fieldChange["latitude"] = true;
            this._latitude = value;
        }
    }

    get longitude(): number {
        return this._longitude;
    }

    set longitude(value: number) {
        if (value != this._longitude) {
            this._fieldChange["longitude"] = true;
            this._longitude = value;
        }
    }

    get openingHours(): string {
        return this._openingHours;
    }

    set openingHours(value: string) {
        if (value != this._openingHours) {
            this._fieldChange["openingHours"] = true;
            this._openingHours = value;
        }
    }

    hasFieldChanged(fieldName: string): boolean {
        return this._fieldChange[fieldName];
    }

    changedFields(): string[] {
        return [];
    }

    resetFieldChanges() {
        ["owner", "latitude", "longitude", "openingHours"].forEach(name => this._fieldChange[name] = false);
    }

    static deserialize(payload: any): Station {
        const station = new Station();
        station._id = payload["id"];
        station._owner = payload["owner"];
        station._latitude = payload["latitude"] / 1000000;
        station._longitude = payload["longitude"] / 1000000;
        station._openingHours = web3Utils.hexToString(payload["openingHours"]);
        return station;
    }
}



