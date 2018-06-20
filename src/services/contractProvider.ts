import { ConfigProvider } from './configProvider';
import { Contract } from '../models/contract';
import { ToolKit } from '../utils/toolKit';
import { Key } from '../models/key';

const Web3 = require('web3');

export class ContractProvider {

    private web3;
    private definitions;

    constructor(private config: ConfigProvider) {
        this.web3 = new Web3(config.ethProvider);
        // console.log("Using eth provider", config.ethProvider);
        this.definitions = ToolKit.contractDefsForStage(config.stage);
    }

    obtain(contractDefKey: string, address?: string): Contract {
        const contractDef = this.definitions[contractDefKey];
        if (contractDefKey === 'MSPToken') {
            // use the address parameter, else from the config, else the default
            contractDef.address = address || this.config.tokenAddress || contractDef.address;
        }
        return new Contract(this.web3, {
            abi: contractDef.abi,
            address: contractDef.address,
            gasPrice: this.config.gasPrice
        });
    }

    async deploy(contractDefKey: string, args: any[], key: Key): Promise<Contract> {
        const contractDef = this.definitions[contractDefKey];
        const contract = new this.web3.eth.Contract(contractDef.abi);
        const deploymentData = contract.deploy({
            data: contractDef.bytecode,
            arguments: args
        }).encodeABI();
        const txData = {
            nonce: await this.web3.eth.getTransactionCount(key.address),
            data: deploymentData,
            gas: 4000000
        };
        const signedTx = key.sign(txData);
        const receipt = await this.web3.eth.sendSignedTransaction('0x' + signedTx.toString('hex'));
        this.config.tokenAddress = receipt.contractAddress;
        return this.obtain(contractDefKey);
    }

}
