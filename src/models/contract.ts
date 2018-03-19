import { EventPollerService, PollerService } from './../services/eventPollerService';
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Wallet } from "./wallet";

export class Contract {

    private contract: any;
    private address: string;
    private gasPrice: number | undefined;

    constructor(private web3: any, private config: { abi: any, address: string, gasPrice?: number }) {
        this.address = config.address;
        this.gasPrice = config.gasPrice;
        this.contract = new this.web3.eth.Contract(config.abi, config.address);
    }

    get native() {
        return this.contract;
    }

    async call(method: string, ...args: any[]): Promise<any> {
        return this.contract.methods[method](...args).call();
    }

    async send(method: string, wallet: Wallet, ...args: any[]): Promise<any> {
        const tx = await this.createTx(method, wallet, ...args);
        const serializedTx = wallet.sign(tx);
        return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    private async createTx(method: string, wallet: Wallet, ...args: any[]): Promise<any> {
        const tx = this.contract.methods[method](...args);
        const gas = await tx.estimateGas({ from: wallet.address });
        const data = await tx.encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(wallet.address);
        return {
            nonce,
            // from: wallet.address,
            to: this.address,
            gasPrice: this.gasPrice,
            gas,
            value: 0,
            data
        };
    }

}