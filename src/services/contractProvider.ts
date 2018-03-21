import { IDefs } from '../interfaces/iDefs';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';

export interface IContractProvider {
    obtain(key: string): Promise<Contract>;
}

export class ContractProvider implements IContractProvider {

    private defs;

    constructor(private web3, private config) {
        this.defs = ToolKit.contractDefsForStage(config.stage);
    }

    async obtain(key: string): Promise<Contract> {
        const contractDef = this.defs[key];
        return new Contract(this.web3, {
            abi: contractDef.abi,
            address: contractDef.address,
            gasPrice: this.config.gasPrice
        });
    }
}
