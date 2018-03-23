import { ConfigProvider } from './configProvider';
import { IDefs } from '../interfaces/iDefs';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../models/symbols';
import "reflect-metadata";
const Web3 = require('web3');

export interface IContractProvider {
    obtain(key: string): Promise<Contract>;
}

@injectable()
export class ContractProvider implements IContractProvider {

    private web3;
    private definitions;

    constructor(@inject(Symbols.ConfigProvider) private config: ConfigProvider) {
        this.web3 = new Web3(config.provider);
        this.definitions = ToolKit.contractDefsForStage(config.stage);
    }

    async obtain(key: string): Promise<Contract> {
        const contractDef = this.definitions[key];
        return new Contract(this.web3, {
            abi: contractDef.abi,
            address: contractDef.address,
            gasPrice: this.config.gasPrice
        });
    }
}
