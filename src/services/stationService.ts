import { Station } from './../models/station';

export class StorageService {

    constructor(datastore: object) {
    }

    getAllStations(): Station[] {
        return [];
    }

    getStation(stationId: string): Station {
        // read from block chain
        return new Station();
    }

    createStation(data: { owner: string, latitude: number, longitude: number, openingHours: string }): Station {
        let station = new Station();
        station.owner = data.owner;
        station.latitude = data.latitude;
        station.longitude = data.longitude;
        station.openingHours = data.openingHours;
        // persist station to blockchain or throw!
        return station;
    }

    updateStation(station: Station) {
        let changedFields = station.changedFields();
        station.resetFieldChanges();
    }

}
