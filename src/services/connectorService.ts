import { Connector } from './../models/connector';
import { Wallet } from '../models/wallet';
import { Contract } from '../models/contract';
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

    useWallet(wallet: Wallet) {
        return {
            create: async (connector: Connector) => {
            },
            update: async (connector: Connector) => {
            },
            useBatch() {
                return {
                    create: async (connector: Connector) => {
                    },
                    update: async (connector: Connector) => {
                    }
                }
            }
        }
    }
}