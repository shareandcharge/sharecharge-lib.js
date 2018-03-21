import { Station } from '../src/models/station';
import { OpeningHours } from '../src';

export class StationBuilder {

    private owner: string = "0x0000000000000000000000000000000000000000";
    private latitude: number = 52.51667;
    private longitude: number = 13.38333;
    private openingHours: OpeningHours = new OpeningHours();

    withOwner(val: string): StationBuilder {
        this.owner = val; return this;
    }

    withLatitude(val: number): StationBuilder {
        this.latitude = val; return this;
    }

    withLongitude(val: number): StationBuilder {
        this.longitude = val; return this;
    }

    withOpeningHours(val: OpeningHours): StationBuilder {
        this.openingHours = val; return this;
    }

    build(): Station {
        const station = new Station();
        station.owner = this.owner;
        station.latitude = this.latitude;
        station.longitude = this.longitude;
        station.openingHours = this.openingHours;
        return station;
    }
}
