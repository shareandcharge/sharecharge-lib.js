import { EventHandler } from './../services/eventHandler';
import { EventPollerService, PollerService } from './../services/eventPollerService';
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Request } from "../models/request";
import { Wallet } from "./wallet";

export class Contract {

    private contract: any;
    private address: string;
    private gasPrice: number;

    constructor(private wallet: Wallet, private web3: any, private eventPoller: PollerService,
                eventHandler: EventHandler, private config: { abi: any, address: string, gasPrice: number }) {
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

    async send(method: string, ...args: any[]): Promise<any> {
        const tx = await this.createTx(method, ...args);
        const serializedTx = this.wallet.sign(tx);
        return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    private async createTx(method: string, ...args: any[]): Promise<any> {
        const tx = this.contract.methods[method](...args);
        const gas = await tx.estimateGas({ from: this.wallet.address });
        const data = await tx.encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(this.wallet.address);
        return {
            nonce,
            address: this.wallet.address,
            to: this.address,
            gasPrice: this.gasPrice,
            gas,
            value: 0,
            data
        };
    }

}