import { Connector } from '../models/connector';
import { Contract } from "../models/contract";
import { Station } from '../models/station';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { IContractProvider } from './contractProvider';

export class ConnectorService {

    private _resolved;

    constructor(private contractProvider: IContractProvider) {
    }

    async contract(): Promise<Contract> {
        this._resolved = this._resolved || await this.contractProvider.obtain('ConnectorStorage');
        return this._resolved;
    }

    async getById(id: string): Promise<Connector> {
        const contract = await this.contract();
        const result = await contract.call("getConnector", id);
        return Connector.deserialize(result);
    }

    async getByStation(station: Station): Promise<Connector[]> {
        const contract = await this.contract();
        const connectors: Connector[] = [];
        const connectorIds = await contract.call("getStationConnectors", station.id);
        for (const id of connectorIds) {
            const connector = await contract.call("getConnector", id);
            connectors.push(Connector.deserialize(connector));
        }
        return connectors;
    }

    async anyFree(station: Station): Promise<boolean> {
        const contract = await this.contract();
        const result = await contract.call("getStationAvailability", station.id);
        return result;
    }

    async isPersisted(connector: Connector): Promise<boolean> {
        const contract = await this.contract();
        const result = await contract.call("getIndexById", connector.id);
        return result >= 0;
    }

    useWallet(wallet: Wallet) {
        return {
            create: async (connector: Connector) => {
                const contract = await this.contract();
                const id = connector.id;
                const owner = wallet.address;
                const stationId = connector.stationId;
                const plugMask = ToolKit.toPlugMask(connector.plugTypes);
                const available = connector.available;
                await contract.send("addConnector", [id, owner, stationId, plugMask, available], wallet);
            },
            update: async (connector: Connector) => {
                const contract = await this.contract();
                if (await contract.call("getIndexById", connector.id) >= 0) {
                    await Promise.all(connector.tracker.getProperties().map(async name => {
                        if (connector.tracker.didPropertyChange(name)) {
                            const funcName = "set" + name.charAt(0).toUpperCase() + name.substr(1);
                            return await contract.send(funcName, [connector.id, connector[name]], wallet);
                        }
                    }));
                    connector.tracker.resetProperties();
                }
            }
        };
    }
}
