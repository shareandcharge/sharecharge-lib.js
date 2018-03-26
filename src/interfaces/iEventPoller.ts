import { Contract } from "../models/contract";

export interface IEventPoller {

    monitor(key: string, contract: Contract);

    notify(callback: (events: any) => void);

    poll();

    start();

    stop()

    reset();
}