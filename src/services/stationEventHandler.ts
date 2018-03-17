import { StationEvents } from './../models/stationEvents';
import { PollerService } from './eventPollerService';
import { EventDispatcher } from '../models/eventDispatcher';
import { Contract } from '../models/contract';

export class StationEventHandler {

    private eventDispatcher = new EventDispatcher<StationEvents>();

    constructor(pollerService: PollerService, contract: Contract) {
        pollerService.add(contract.native, events => events.forEach(item => {
            const eventName: string = item.event.substring('Station'.length);
            const stationId: string = item.returnValues.stationId;
            this.eventDispatcher.dispatchAll(StationEvents[eventName], stationId);
        }));
    }

    on(event: StationEvents, callback: (id: string) => {}) {
        this.eventDispatcher.addEventListener(event, callback);
    }

    clear() {
        Object.keys(StationEvents).map(k => this.eventDispatcher.removeAllListeners(StationEvents[k]));
    }
}