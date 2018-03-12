import * as EthereumTx from 'ethereumjs-tx';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { config } from '../config/config';
import { IContract } from '../models/contract';
import { Request } from '../models/request';
import { Receipt } from '../models/receipt';
import { createPayload, createReceipt } from '../utils/helpers';

const Web3 = require('web3');

export class Contract implements IContract {

    private web3: any;
    private contract: any;
    private personal: any;
    private pass: any;

    private source = new Subject<Request>();
    readonly events$: Observable<Request> = this.source.asObservable();

    constructor({pass = '', provider = config.node}) {

        this.pass = pass;
        this.web3 = new Web3(provider);
        this.personal = this.web3.eth.personal;

        this.contract = new this.web3.eth.Contract(config.chargeAbi, config.chargeAddr);

        this.watchEvents();
    }

    watchEvents(): void {

        const events = [
            'StartRequested',
            'StartConfirmed',
            'StopRequested',
            'StopConfirmed',
            'Error'];

        events.forEach(ev => {
            this.contract.events[ev]({}, (err, res) => {
                if (err) {
                    this.source.error(new Error(err));
                } else {
                    this.source.next(createPayload(ev, res.returnValues));
                }
            });
        });
    }

    async getCoinbase() {
        return this.web3.eth.getCoinbase();
    }

    async getNonce(address: string): Promise<number> {
        return this.web3.eth.getTransactionCount(address);
    }

    convertBytes(bytes: string): string {
        const str = this.web3.utils.hexToString(bytes);
        return this.web3.utils.fromAscii(str);
    }

    private async createTxData(from: string, method: string, ...args: any[]): Promise<any> {
        const tx = this.contract.methods[method](...args);
        return {
            data: await tx.encodeABI(),
            gas: await tx.estimateGas({from})
        };
    }

    async createTx(from: string, method: string, ...args: any[]): Promise<any> {
        const tx = await this.createTxData(from, method, ...args);
        const nonce = await this.getNonce(from);
        return {
            nonce,
            from,
            to: config.chargeAddr,
            gasPrice: config.gasPrice,
            gas: tx.gas,
            value: 0,
            data: tx.data
        };
    }

    signTx(txObject, privKey: Buffer): Buffer {
        const tx = new EthereumTx(txObject);
        tx.sign(privKey);
        return tx.serialize();
    }

    async sendRawTx(serializedTx: Buffer): Promise<any> {
        return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    async queryState(method: string, ...args: any[]): Promise<any> {

        if (!this.contract.methods[method]) {
            throw new Error(`Method: ${method} not found in contract`);
        }

        const query = this.contract.methods[method](...args);
        return query.call();
    }

    async sendTx(method: string, ...args: any[]): Promise<Receipt> {

        if (!this.contract.methods[method]) {
            throw new Error(`Method: ${method} not found in contract`);
        }

        const coinbase = await this.web3.eth.getCoinbase();
        // console.log('args:', args);
        const tx = this.contract.methods[method](...args);
        // const gas1 = await this.web3.eth.estimateGas({ data: tx.rawTransaction, from: coinbase });
        const gas2 = await tx.estimateGas({from: coinbase});
        await this.personal.unlockAccount(coinbase, this.pass, 30);
        const receipt = await tx.send({from: coinbase, gas: gas2});
        return createReceipt(receipt);
    }

}
