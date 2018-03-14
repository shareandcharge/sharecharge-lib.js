import { StorageService } from "./services/stationService";
import { ConnectorService } from "./services/connectorService";

export class Test {

    public stationMagic() {

        let stationService = new StorageService({});

        let stations = stationService.getAllStations();

        let station = stationService.createStation({
            owner: "Joe Bloggs",
            latitude: 54.4565,
            longitude: 43.2345,
            openingHours: ""
        });

        station.latitude = 100;

        stationService.updateStation(station);

        station = stationService.getStation("0x801994d0d4af5e9f77d6bd553221cebea62f808d");
    }

    public connectorMagic() {
        let connectorService = new ConnectorService({});

        let connector = connectorService.getById("0x01");

        connectorService.updateConnector(connector, {});

        let connectors = connectorService.getConnectors("0x801994d0d4af5e9f77d6bd553221cebea62f808d");

        connectorService.createConnector("0x801994d0d4af5e9f77d6bd553221cebea62f808d", {

        });

    }

}