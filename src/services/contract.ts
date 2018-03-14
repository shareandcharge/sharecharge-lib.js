import { Wallet } from "./wallet";

const Web3 = require('web3');

export class Contract {

    private web3: any;
    private contract: any;

    private address: string;
    private gasPrice: number;
    private wallet: Wallet;

    constructor(config: any, name: string, wallet: Wallet) {
        this.web3 = new Web3(config.provider);
        this.address = config.contracts[name].address;
        this.gasPrice = config.gasPrice;
        this.wallet = wallet;
        this.contract = new this.web3.eth.Contract(config.contracts[name].abi, this.address);
    }

    async call(method: string, ...args: any[]): Promise<any> {
        return this.contract.methods[method](...args).call();
    }

    async send(from: string, method: string, ...args: any[]): Promise<any> {
        const tx = await this.createTx(from, method, ...args);
        const serializedTx = this.wallet.sign(tx);
        return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    private async createTx(from: string, method: string, ...args: any[]): Promise<any> {
        const tx = this.contract.methods[method](...args);
        const gas = await tx.estimateGas({ from });
        const data = await tx.encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(from);
        return {
            nonce,
            from,
            to: this.address,
            gasPrice: this.gasPrice,
            gas,
            value: 0,
            data
        };
    }

}