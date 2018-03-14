import { Connector } from './../models/evConnector';

export class ConnectorService {

    constructor(datastore: object) {
    }

    getById(connectorId: string): Connector {
        return new Connector();
    }

    getConnectors(stationId: string): Connector[] {
        return [];
    }

    createConnector(stationId: string, data: object): string {
        return "";
    }

    updateConnector(connector: Connector, data: object) {
        connector.resetFieldChanges();
    }

}
