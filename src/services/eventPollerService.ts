import { Contract } from "../models/contract";

interface ContractTracker {
    contract: Contract;
    callback: (events: any) => void;
    fromBlock: number;
}

export interface PollerService {
    start();

    stop();

    poll();

    add(contract: Contract, callback: (events: any) => void);

    remove(contract: Contract);

    removeAll();
}

export class EventPollerService implements PollerService {

    private static singleton;

    private intervalID: any;
    private callbacks = new Map<string, ContractTracker>();

    private constructor(private interval: number) {
    }

    static get instance(): EventPollerService {
        if (!this.singleton) {
            this.singleton = new EventPollerService(1000);
        }
        return this.singleton;
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
        this.callbacks.forEach((tracker: ContractTracker) => {
            promises.push(tracker.contract.native.getPastEvents({ fromBlock: tracker.fromBlock })
                .then(pastEvents => {
                    if (pastEvents.length > 0) {
                        tracker.fromBlock = pastEvents[pastEvents.length - 1].blockNumber + 1;
                        tracker.callback(pastEvents);
                    }
                }));
        });
        return Promise.all(promises);
    }

    async add(contract: Contract, callback: (events: any) => void) {
        let block = await contract.getBlockNumber() + 1;
        this.callbacks.set(contract.native.options.address, { contract, callback, fromBlock: block });
    }

    remove(contract: Contract) {
        this.callbacks.delete(contract.native.options.address);
    }

    removeAll() {
        this.callbacks.clear();
    }
}