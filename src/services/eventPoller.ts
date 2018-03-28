import { Subject } from "rxjs/Subject";
import { ConfigProvider } from "./configProvider";
import { Contract } from "../models/contract";
import { inject, injectable } from "inversify";
import { Symbols } from '../symbols';
import "reflect-metadata";
const Web3 = require('web3');

@injectable()
export class EventPoller {

    private web3;
    private intervalMillis: number;
    private intervalID: any;
    private contracts = new Map<string, Contract>();
    private fromBlock: number = -1;

    public readonly events = new Subject<any[]>();

    public constructor(@inject(Symbols.ConfigProvider) private config: ConfigProvider) {
        this.web3 = new Web3(config.provider);
        this.intervalMillis = config.pollingInterval;
    }

    start() {
        if (!this.intervalID) {
            this.intervalID = setInterval(async () => await this.poll(), this.intervalMillis);
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
        this.contracts.forEach(contract => promises.push(
            contract.native.getPastEvents({ fromBlock: this.fromBlock })
                .then(pastEvents => this.events.next(pastEvents))
        ));
        await Promise.all(promises);
        this.fromBlock = await this.web3.eth.getBlockNumber() + 1;
    }

    monitor(key: string, contract: Contract) {
        this.contracts.set(key, contract);
    }
}