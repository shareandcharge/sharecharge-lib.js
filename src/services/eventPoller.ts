import { IEventPoller } from './../interfaces/iEventPoller';
import { Contract } from "../models/contract";
import { injectable } from "inversify";
import { Symbols } from '../symbols';
import "reflect-metadata";

interface ContractTracker {
    contract: Contract;
    fromBlock: number;
}

@injectable()
export class EventPoller implements IEventPoller {

    private intervalID: any;
    private trackers = new Map<string, ContractTracker>();
    private callbacks = new Array();

    public constructor(private interval: number = 1000) {
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
        const promises: any[] = [];
        this.trackers.forEach(tracker => {
            promises.push(tracker.contract.native.getPastEvents({ fromBlock: tracker.fromBlock })
                .then(pastEvents => {
                    if (pastEvents.length > 0) {
                        tracker.fromBlock = pastEvents[pastEvents.length - 1].blockNumber + 1;
                        this.callbacks.forEach(callback => callback(pastEvents));
                    }
                }));
        });
        return Promise.all(promises);
    }

    async monitor(key: string, contract: Contract) {
        const block = await contract.getBlockNumber() + 1;
        this.trackers.set(key, { contract, fromBlock: block });
    }

    notify(callback: (events: any) => void) {
        this.callbacks.push(callback);
    }

    reset() {
        this.callbacks = new Array();
    }
}