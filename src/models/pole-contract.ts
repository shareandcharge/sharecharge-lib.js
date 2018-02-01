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

        this.contract.events.StartRequested({}, (err, res) => {
            if (err) {
                this.source.error(new Error(err));
            } else {
                this.source.next(this.formatPayload('start', res.returnValues));
            }
        });

        this.contract.events.StopRequested({}, (err, res) => {
            if (err) {
                this.source.error(new Error(err));
            } else {
                this.source.next(this.formatPayload('stop', res.returnValues));
            }
        });

        console.log('Listening for events...');
    }

    confirmStart(connectorId: string, controller: string): Promise<Receipt> {
        const start = this.contract.methods.confirmStart;
        const params = Array.from(arguments);
        return this.sendTx(start, ...params);
    }
    confirmStop(connectorId: string): Promise<Receipt> {
        const stop = this.contract.methods.confirmStop;
        const params = Array.from(arguments);
        return this.sendTx(stop, ...params);
    }
    logError(connectorId: string, errorCode: number): Promise<Receipt> {
        const error = this.contract.methods.logError;
        const params = Array.from(arguments);
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

    private formatPayload(type, values): Request {
        return {
            type,
            connectorId: values.connectorId,
            controller: values.controller
        };
    }
}
