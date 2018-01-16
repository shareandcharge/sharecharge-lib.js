import Web3 = require('web3');
import { Subject } from 'rxjs/Subject';
import { config } from '../config/config';
import { IContract } from './contract';
import { Request } from './request';
import { Receipt } from './receipt';

export class PoleContract implements IContract {

    private web3: Web3;
    private contract: any;
    private personal: any;
    private pass: any;
    private coinbase: string;

    private source = new Subject<Request>();

    events$ = this.source.asObservable();

    constructor(pass: string, provider?: string) {
        this.pass = pass;
        this.web3 = new Web3(provider || config.node);
        this.personal = this.web3.eth.personal;
        this.web3.eth.getCoinbase()
            .then(cb => this.coinbase = cb)
            .catch(err => { throw Error(err); });

        this.contract = new this.web3.eth.Contract(config.chargeAbi, config.chargeAddr);

        this.contract.events.ClientRequestedStart({}, (err, res) => {
            if (err) {
                this.source.error(new Error(err));
            } else {
                this.source.next(this.formatPayload('start', res.returnValues));
            }
        });

        this.contract.events.ClientRequestedStop({}, (err, res) => {
            if (err) {
                this.source.error(new Error(err));
            } else {
                this.source.next(this.formatPayload('stop', res.returnValues));
            }
        });
    }

    confirmStart(request: Request): Promise<Receipt> {
        const start = this.contract.methods.start;
        const params = Array.from(Object.create(request));
        return this.sendTx(start, ...params);
    }
    confirmStop(request: Request): Promise<Receipt> {
        const stop = this.contract.methods.stop;
        const params = Array.from(Object.create(request));
        return this.sendTx(stop, ...params);
    }
    sendError(request: Request): Promise<Receipt> {
        const error = this.contract.methods.failure;
        const params = Array.from(Object.create(request));
        return this.sendTx(error, ...params);
    }

    private async sendTx(method, ...args: any[]): Promise<Receipt> {
        const gas = await method(...args).estimateGas({ from: this.coinbase });
        const unlocked = await this.personal.unlockAccount(this.coinbase, this.pass, 60);
        const receipt = await method(...args).send({ from: this.coinbase, gas });
        return this.formatReceipt(receipt);
    }

    private formatReceipt(txObject): Receipt {
        return {
            status: 'mined',
            txHash: txObject.transactionHash,
            blockNumber: txObject.blockNumber
        };
    }

    private formatPayload(type, vals) {
        return {
            type: type,
            pole: vals['poleID'],
            user: vals['user'],
        };
    }
}
