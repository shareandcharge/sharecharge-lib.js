import { Connector } from './../models/evConnector';
import { Contract } from './contract';

export class ConnectorService {

    constructor(contract: Contract) {
    }

    getById(connectorId: string): Connector {
        return new Connector();
    }

    getStationConnectors(stationId: string): Connector[] {
        return [];
    }

    createConnector(stationId: string, data: object): string {
        return "";
    }

    updateConnector(connector: Connector, data: object) {
        connector.resetFieldChanges();
    }

}
