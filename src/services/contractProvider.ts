import { ConfigProvider } from './configProvider';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';
import { Key } from '../models/key';

const Web3 = require('web3');

export class ContractProvider {

    private web3;
    private definitions;

    constructor(private config: ConfigProvider) {
        this.web3 = new Web3(config.provider);
        this.definitions = ToolKit.contractDefsForStage(config.stage);
    }

    obtain(key: string, address?: string): Contract {
        const contractDef = this.definitions[key];
        if (key == 'MSPToken' && !address) {
            contractDef.address = this.config.tokenAddress;
        }
        return new Contract(this.web3, {
            abi: contractDef.abi,
            address: address || contractDef.address,
            gasPrice: this.config.gasPrice
        });
    }

    async deploy(contractDefKey: string, args: any[], key: Key): Promise<Contract> {
        const contractDef = this.definitions[contractDefKey];
        const contract = new this.web3.eth.Contract(contractDef.abi);
        const data = contract.deploy({
            data: contractDef.bytecode,
            arguments: args
        }).encodeABI();
        const txData = {
            nonce: await this.web3.eth.getTransactionCount(key.address),
            data,
            gas: 3000000
        };
        const signedTx = key.sign(txData);
        const receipt = await this.web3.eth.sendSignedTransaction('0x' + signedTx.toString('hex'));
        return this.obtain(contractDefKey, receipt.contractAddress);
    }


}
