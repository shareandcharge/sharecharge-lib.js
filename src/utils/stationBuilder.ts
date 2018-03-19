import { Station } from '../models/station';

export class StationBuilder {

    private owner: string = "0x0000000000000000000000000000000000000000";
    private latitude: number = 52.51667;
    private longitude: number = 13.38333;
    private openingHours: string = "0000000000000000000000000000";
    private available: boolean = true;

    withOwner(val: string): StationBuilder {
        this.owner = val; return this;
    }

    withLatitude(val: number): StationBuilder {
        this.latitude = val; return this;
    }

    withLongitude(val: number): StationBuilder {
        this.longitude = val; return this;
    }

    withOpeningHours(val: string): StationBuilder {
        this.openingHours = val; return this;
    }

    isAvailable(val: boolean): StationBuilder {
        this.available = val; return this;
    }

    build(): Station {
        let station = new Station();
        station.owner = this.owner;
        station.latitude = this.latitude;
        station.longitude = this.longitude;
        station.openingHours = this.openingHours;
        station.available = this.available;
        return station;
    }
}