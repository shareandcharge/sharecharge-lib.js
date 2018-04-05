import { ConfigProvider } from './configProvider';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';

const Web3 = require('web3');

export class ContractProvider {

    private web3;
    private definitions;

    constructor(private config: ConfigProvider) {
        this.web3 = new Web3(config.provider);
        this.definitions = ToolKit.contractDefsForStage(config.stage);
    }

    obtain(key: string): Contract {
        const contractDef = this.definitions[key];
        return new Contract(this.web3, {
            abi: contractDef.abi,
            address: contractDef.address,
            gasPrice: this.config.gasPrice
        });
    }
}
