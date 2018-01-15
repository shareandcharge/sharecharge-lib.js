import { Subject } from 'rxjs/Subject';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/from';
// import 'rxjs/add/observable/fromPromise';
import Web3 = require('web3');

import { config } from './config/config';
import { Receipt } from './config/types';
import { StartRequest } from './models/start-request';
import { StopRequest } from './models/stop-request';

export class Bridge {

    private initialised = false;
    private config: any;
    private pass: string;
    private web3: Web3;
    private personal: any;
    private contract: any;
    private coinbase: string;

    private startSource = new Subject<StartRequest>();
    private stopSource = new Subject<StopRequest>();

    start$ = this.startSource.asObservable();
    stop$ = this.stopSource.asObservable();

    constructor(pass: string, provider?: string) {
        this.pass = pass;
        this.web3 = new Web3(provider || config.node);
        this.personal = this.web3.eth.personal;
        this.web3.eth.getCoinbase()
            .then(cb => this.coinbase = cb)
            .catch(err => { throw Error(err); });
    }

    get version(): string {
        return config.version;
    }

    listen(): void {
        this.initialise();

        this.contract.events.ClientRequestedStart({}, (reject, resolve) => {
            const pole = resolve.returnValues['poleID'];
            const user = resolve.returnValues['user'];

            // const wattPower = resolve.returnValues['_wattPower'];
            // const secondsToRent = resolve.returnValues['_secondsToRent'];
            this.startSource.next(new StartRequest(pole, user));
        });

        this.contract.events.ClientRequestedStop({}, (reject, resolve) => {
            const pole = resolve.returnValues['poleID'];
            const user = resolve.returnValues['user'];
            // const measuredWatt = resolve.returnValues['_measuredWatt'];
            this.stopSource.next(new StopRequest(pole, user));
        });
    }

    async confirmStart(request: StartRequest): Promise<Receipt> {
        const start = this.contract.methods.start;
        const params = Array.from(Object.create(request));
        return this.sendTx(start, ...params);
    }

    async confirmStop(request: StopRequest): Promise<Receipt> {
        const stop = this.contract.methods.stop;
        const params = Array.from(Object.create(request));
        return this.sendTx(stop, ...params);
    }

    async sendError(request: StartRequest | StopRequest): Promise<Receipt> {
        const error = this.contract.methods.failure;
        const params = Array.from(Object.create(request));
        return this.sendTx(error, ...params);
    }

    private async sendTx(method, ...args: any[]): Promise<Receipt> {
        const gas = await method(...args).estimateGas({from: this.coinbase});
        const unlocked = await this.personal.unlockAccount(this.coinbase, this.pass, 60);
        const receipt = await method(...args).send({from: this.coinbase, gas});
        return this.formatReceipt(receipt);
    }

    private formatReceipt(txObject): Receipt {
        return {
            status: 'mined',
            txHash: txObject.transactionHash,
            blockNumber: txObject.blockNumber
        };
    }

    private initialise(): void {
        if (this.initialised) {
            return;
        }
        this.contract = new this.web3.eth.Contract(config.chargeAbi, config.chargeAddr);
        this.initialised = true;
    }
}