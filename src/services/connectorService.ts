import { Connector } from '../models/connector';
import { Contract } from "../models/contract";
import { Station } from '../models/station';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';

export class ConnectorService {

    constructor(private contract: Contract) {
    }

    async getById(id: string): Promise<Connector> {
        const result = await this.contract.call("getConnector", id);
        return Connector.deserialize(result);
    }

    async getByStation(station: Station): Promise<Connector[]> {
        return Promise.resolve([]);
    }

    async create(connector: Connector, wallet: Wallet) {
        const id = connector.id;
        const owner = connector.owner;
        const stationId = connector.stationId;
        const plugMask = ToolKit.toPlugMask(connector.plugTypes);
        const available = connector.available;
        return await this.contract.send("addConnector", wallet, id, owner, stationId, plugMask, available);
    }

    async update(connector: Connector, wallet: Wallet) {
    }

    async delete(connector: Connector, wallet: Wallet) {
    }

}

const Web3 = require('web3');
const config = require(process.env["HOME"] + '/.sharecharge/config.json');

const init = () => {

    const web3 = new Web3("http://localhost:8545");
    const connectorStorage = config['ConnectorStorage'];

    console.log(connectorStorage.address);

    return new Contract(web3, {
        abi: connectorStorage.abi,
        address: connectorStorage.address
    });
};

export const ConnectorServiceInstance: ConnectorService = new ConnectorService(init());