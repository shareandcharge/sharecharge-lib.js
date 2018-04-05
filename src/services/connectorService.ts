import { Connector } from './../models/connector';
import { Wallet } from '../models/wallet';
import { Key } from '../models/key';
import { Contract } from '../models/contract';
import { ContractProvider } from './contractProvider';

export class ConnectorService {

    public readonly contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('ConnectorStorage');
    }

    async getById(id: string): Promise<Connector> {
        const contract = this.contract;
        const result = await contract.call("getById", id);
        return Connector.deserialize(result);
    }

    async getByEvse(id: string): Promise<Connector[]> {
        const contract = this.contract;
        const connectorIds = await contract.call("getIdsByEvse", id);
        const connectors: Connector[] = [];
        for (const connectorId of connectorIds) {
            const connector = await this.getById(connectorId);
            connectors.push(connector);
        }
        return connectors;
    }

    useWallet(wallet: Wallet, keyIndex: number = 0) {
        const key = wallet.keychain[keyIndex];
        return {
            create: this.create(key),
            update: this.update(key),
            batch: () => {
                return {
                    create: this.batchCreate(key),
                    update: this.batchUpdate(key)
                };
            }
        };
    }

    private create(key: Key) {
        return async (connector: Connector) => {
            const contract = this.contract;
            await contract.send("create", this.toParameters(connector), key);
        };
    }

    private batchCreate(key: Key) {
        return async (...connectors: Connector[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const connector of connectors) {
                const tx = await contract.request("create", this.toParameters(connector), key);
                batch.add(tx);
                key.nonce++;
            }
            batch.execute();
        };
    }

    private update(key: Key) {
        return async (connector: Connector) => {
            const contract = this.contract;
            await contract.send("update", this.toParameters(connector), key);
        };
    }

    private batchUpdate(key: Key) {
        return async (...connectors: Connector[]) => {
            const contract = this.contract;
            const batch = contract.newBatch();
            key.nonce = await contract.getNonce(key);
            for (const connector of connectors) {
                const tx = await contract.request("update", this.toParameters(connector), key);
                batch.add(tx);
                key.nonce++;
            }
            batch.execute();
        };
    }

    toParameters(connector: Connector): any[] {
        const id = connector.id;
        const evseId = connector.evseId;
        const standard = connector.standard;
        const powerType = connector.powerType;
        const voltage = connector.voltage;
        const amperage = connector.amperage;
        return [id, evseId, standard, powerType, voltage, amperage];
    }

}