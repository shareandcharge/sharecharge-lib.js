import Web3 = require('web3');
import {Subject} from 'rxjs/Subject';
import {config} from '../config/config';
import {IContract} from '../models/contract';
import {Request} from '../models/request';
import {Receipt, ReturnStatusObject} from '../models/receipt';

export class Contract implements IContract {

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

    private async sendTx(method, ...args: any[]): Promise<Receipt> {
        const coinbase = await this.web3.eth.getCoinbase();
        const tx = this.contract.methods[method](...args);
        const gas = await tx.estimateGas({from: coinbase});
        const unlocked = await this.personal.unlockAccount(coinbase, this.pass, 60);
        const receipt = await tx.send({from: coinbase, gas});
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

    confirmStart(connectorId: string, controller: string): Promise<Receipt> {
        const params = Array.from(arguments);
        return this.sendTx('confirmStart', ...params);
    }

    confirmStop(connectorId: string): Promise<Receipt> {
        const params = Array.from(arguments);
        return this.sendTx('confirmStop', ...params);
    }

    logError(connectorId: string, errorCode: number): Promise<Receipt> {
        const params = Array.from(arguments);
        return this.sendTx('logError', ...params);
    }

    async updateStatuses(chargePoints: string[], clientId: string): Promise<(string | undefined)[]> {

        return Promise.all(chargePoints.map(async point => {
            try {
                const isAvailable = await this.queryState('isAvailable', point);
                if (isAvailable) {
                const receipt = await this.sendTx('setAvailability', clientId, point, false);
                return point;
                }
            } catch (err) {
                throw Error(err.message);
            }
        }));
    }

    async queryState(method, ...args: any[]): Promise<any> {
        const query = this.contract.methods[method](...args);
        return query.call();
    }
}
