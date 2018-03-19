import { ChargingEvents } from './../models/chargingEvents';
import { PollerService } from './eventPollerService';
import { EventDispatcher } from '../models/eventDispatcher';
import { Contract } from '../models/contract';

export class ChargingEventHandler {

    private eventDispatcher = new EventDispatcher<ChargingEvents>();

    constructor(pollerService: PollerService, contract: Contract) {
        pollerService.add(contract.native, events => events.forEach(item => {
            const eventName: string = item.event;
            const connectorId: string = item.returnValues.connectorId;
            const controller: string = item.returnValues.controller;
            this.eventDispatcher.dispatchAll(ChargingEvents[eventName], connectorId, controller);
        }));
    }

    on(event: ChargingEvents, callback: (id: string, controller: string) => {}) {
        this.eventDispatcher.addEventListener(event, callback);
    }

    clear() {
        Object.keys(ChargingEvents).map(k => this.eventDispatcher.removeAllListeners(ChargingEvents[k]));
    }
}