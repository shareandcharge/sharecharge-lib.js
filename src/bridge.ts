import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromPromise';
import Web3 = require('web3');

import { StartRequest } from './models/started-request';
import { StopRequest } from './models/stop-request';

export class Bridge {

    private initialised = false;
    private web3: Web3;
    private contract: any;
    private startSource = new Subject<StartRequest>();
    private stopSource = new Subject<StopRequest>();

    start$ = this.startSource.asObservable();
    stop$ = this.stopSource.asObservable();

    constructor() {
        this.web3 = new Web3('ws://0.0.0.0:8546');
    }

    get version() {
        return '0.1.0';
    }

    start() {
        this.initialise();

        this.contract.events.Start({}, (reject, resolve) => {
            const pole = resolve.returnValues['_pole'];
            const wattPower = resolve.returnValues['_wattPower'];
            const secondsToRent = resolve.returnValues['_secondsToRent'];
            this.startSource.next(new StartRequest(pole, wattPower, secondsToRent));
        });

        this.contract.events.Stop({}, (reject, resolve) => {
            const pole = resolve.returnValues['_pole'];
            const measuredWatt = resolve.returnValues['_measuredWatt'];
            this.stopSource.next(new StopRequest(pole, measuredWatt));
        });
    }

    mock() {
        this.web3.eth.getAccounts().then(result => {
            const account = result[0];
            this.contract.methods.start().send({ from: account, gas: 30000 });
        });

        setTimeout(() => {
            this.web3.eth.getAccounts().then(result => {
                const account = result[0];
                this.contract.methods.stop().send({ from: account, gas: 30000 });
            });
        }, 5000);
    }

    private initialise() {
        if (this.initialised) {
            return;
        }
        const abi = [
            {
                'constant': false,
                'inputs': [],
                'name': 'stop',
                'outputs': [],
                'payable': false,
                'stateMutability': 'nonpayable',
                'type': 'function'
            },
            {
                'constant': false,
                'inputs': [],
                'name': 'start',
                'outputs': [],
                'payable': false,
                'stateMutability': 'nonpayable',
                'type': 'function'
            },
            {
                'anonymous': false,
                'inputs': [
                    {
                        'indexed': true,
                        'name': '_pole',
                        'type': 'bytes32'
                    },
                    {
                        'indexed': true,
                        'name': '_wattPower',
                        'type': 'uint256'
                    },
                    {
                        'indexed': true,
                        'name': '_secondsToRent',
                        'type': 'uint256'
                    }
                ],
                'name': 'Start',
                'type': 'event'
            },
            {
                'anonymous': false,
                'inputs': [
                    {
                        'indexed': true,
                        'name': '_pole',
                        'type': 'bytes32'
                    },
                    {
                        'indexed': true,
                        'name': '_measuredWatt',
                        'type': 'uint256'
                    }
                ],
                'name': 'Stop',
                'type': 'event'
            }
        ];
        this.contract = new this.web3.eth.Contract(abi, '0xee2486af990a04b427e9b7940ab2e38b21052c9a');
        this.initialised = true;
    }
}