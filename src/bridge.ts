import { Subject } from 'rxjs/Subject';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/from';
// import 'rxjs/add/observable/fromPromise';
import Web3 = require('web3');

import { config } from './config/config';
import { Config } from './config/types';
import { StartRequest } from './models/start-request';
import { StopRequest } from './models/stop-request';

export class Bridge {

    private initialised = false;
    private config: Config;
    private web3: Web3;
    private contract: any;

    private startSource = new Subject<StartRequest>();
    private stopSource = new Subject<StopRequest>();

    start$ = this.startSource.asObservable();
    stop$ = this.stopSource.asObservable();

    constructor(provider?: any) {
        this.web3 = new Web3(provider || config.node);
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

    // mock(): void {
    //     this.web3.eth.getAccounts().then(result => {
    //         const account = result[0];
    //         this.contract.methods.start().send({ from: account, gas: 30000 });
    //     });

    //     setTimeout(() => {
    //         this.web3.eth.getAccounts().then(result => {
    //             const account = result[0];
    //             this.contract.methods.stop().send({ from: account, gas: 30000 });
    //         });
    //     }, 5000);
    // }

    private initialise(): void {
        if (this.initialised) {
            return;
        }
        this.contract = new this.web3.eth.Contract(config.chargeAbi, config.chargeAddr);
        this.initialised = true;
    }
}