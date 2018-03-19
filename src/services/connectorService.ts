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

    async isPersisted(connector: Connector): Promise<boolean> {
        const result = await this.contract.call("getIndexById", connector.id);
        return result >= 0;
    }

    useWallet(wallet: Wallet) {
        return {
            create: async (connector: Connector) => {
                const id = connector.id;
                const owner = connector.owner;
                const stationId = connector.stationId;
                const plugMask = ToolKit.toPlugMask(connector.plugTypes);
                const available = connector.available;
                await this.contract.send("addConnector", wallet, id, owner, stationId, plugMask, available);
            },
            update: async (connector: Connector) => {

            }
        }
    }
}
