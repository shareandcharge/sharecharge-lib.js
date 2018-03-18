import { Connector } from '../models/connector';
import { Contract } from "../models/contract";

export class ConnectorService {

    constructor(private contract: Contract) {
    }

    async getStationConnectors(stationId: string): Promise<Connector[]> {
        return Promise.resolve([]);
    }

    async getConnector(connectorId: string): Promise<Connector> {
        return new Connector();
    }

    async createConnector(stationId: string, data: object): Promise<string> {
        return "";
    }

    async updateConnector(connector: Connector) {
    }

}
