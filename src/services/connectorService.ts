import { Connector } from '../models/connector';
import { Contract } from "../models/contract";
import { Station } from '../models/station';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { IContractProvider } from './contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../models/symbols';
import "reflect-metadata";

@injectable()
export class ConnectorService {

    private _resolved;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
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
                const owner = connector.owner = wallet.address;
                const stationId = connector.stationId;
                const plugMask = ToolKit.toPlugMask(connector.plugTypes);
                const available = connector.available;
                await contract.send("addConnector", [id, owner, stationId, plugMask, available], wallet);
            },
            createBatch: async (...connectors: Connector[]) => {
                const contract = await this.contract();
                const batch = contract.newBatch();
                wallet.nonce = await contract.getNonce(wallet);
                for (const connector of connectors) {
                    const parameters = [
                        connector.id,
                        wallet.address,
                        connector.stationId,
                        ToolKit.toPlugMask(connector.plugTypes),
                        connector.available
                    ];
                    const tx = await contract.request("addConnector", parameters, wallet);
                    batch.add(tx);
                    wallet.nonce++;
                }
                batch.execute();
            },
            update: async (connector: Connector) => {
                const contract = await this.contract();

                if (await contract.call("getIndexById", connector.id) >= 0) {
                    const batch = contract.newBatch();
                    wallet.nonce = await contract.getNonce(wallet);

                    for (const property of connector.tracker.getProperties()) {
                        if (connector.tracker.didPropertyChange(property)) {
                            const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                            const tx = await contract.request(funcName, [connector.id, connector[property]], wallet);
                            batch.add(tx);
                            wallet.nonce++;
                        }
                    }

                    batch.execute();
                    connector.tracker.resetProperties();
                }
            },
            updateBatch: async (...connectors: Connector[]) => {
                const contract = await this.contract();
                const batch = contract.newBatch();
                wallet.nonce = await contract.getNonce(wallet);

                for (const connector of connectors) {
                    if (await contract.call("getIndexById", connector.id) >= 0) {
                        for (const property of connector.tracker.getProperties()) {
                            if (connector.tracker.didPropertyChange(property)) {
                                const funcName = "set" + property.charAt(0).toUpperCase() + property.substr(1);
                                const tx = await contract.request(funcName, [connector.id, connector[property]], wallet);
                                batch.add(tx);
                                wallet.nonce++;
                            }
                        }
                        connector.tracker.resetProperties();
                    }
                }
                batch.execute();
            }
        };
    }
}
