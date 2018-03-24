import { Contract } from "../models/contract";

interface ContractTracker {
    contract: Contract;
    fromBlock: number;
}

export class EventPoller {

    private static singleton;

    private intervalID: any;
    private trackers = new Map<string, ContractTracker>();
    private callbacks = new Array();

    private constructor(private interval: number) {
    }

    static get instance(): EventPoller {
        if (!EventPoller.singleton) {
            EventPoller.singleton = new EventPoller(1000);
        }
        return EventPoller.singleton;
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

    removeAll() {
        this.callbacks = new Array();
    }
}