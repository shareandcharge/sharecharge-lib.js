import { ConfigProvider } from "./configProvider";
import { IEventPoller } from "../interfaces/iEventPoller";
import { Contract } from "../models/contract";
import { inject, injectable } from "inversify";
import { Symbols } from '../symbols';
import "reflect-metadata";
const Web3 = require('web3');

@injectable()
export class EventPoller implements IEventPoller {

    private web3;
    private interval: number;
    private intervalID: any;
    private contracts = new Map<string, Contract>();
    private callbacks = new Array();
    private fromBlock: number = -1;

    public constructor(@inject(Symbols.ConfigProvider) private config: ConfigProvider) {
        this.web3 = new Web3(config.provider);
        this.interval = config.pollingInterval;
    }

    start() {
        if (!this.intervalID) {
            this.intervalID = setInterval(() => this.poll(), this.interval);
        }
    }

    stop() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = undefined;
        }
    }

    async poll() {
        if (this.fromBlock === -1) {
            this.fromBlock = await this.web3.eth.getBlockNumber();
        }
        const promises: any[] = [];
        this.contracts.forEach(contract => {
            promises.push(contract.native.getPastEvents({ fromBlock: this.fromBlock })
                .then(pastEvents => {
                    if (pastEvents.length > 0) {
                        this.callbacks.forEach(callback => callback(pastEvents));
                    }
                }));
        });
        await Promise.all(promises);
        this.fromBlock = await this.web3.eth.getBlockNumber() + 1;
    }

    monitor(key: string, contract: Contract) {
        this.contracts.set(key, contract);
    }

    notify(callback: (events: any) => void) {
        this.callbacks.push(callback);
    }

    reset() {
        this.callbacks = new Array();
    }
}