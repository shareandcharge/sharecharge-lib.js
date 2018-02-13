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

    private source = new Subject<Request>();

    events$ = this.source.asObservable();

    constructor(pass: string, provider?: string) {
        this.pass = pass;
        this.web3 = new Web3(provider || config.node);
        this.personal = this.web3.eth.personal;

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
        const coinbase = await this.web3.eth.getCoinbase();
        const tx = method(...args);
        const gas = await tx.estimateGas({ from: coinbase });
        const unlocked = await this.personal.unlockAccount(coinbase, this.pass, 60);
        const receipt = await tx.send({ from: coinbase, gas });
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
            clientId: values.clientId,
            connectorId: values.connectorId,
            controller: values.controller
        };
    }
}
