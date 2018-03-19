import { StationEventHandler } from './services/stationEventHandler';
import { ChargingService } from './services/chargingService';
import { EventPollerService } from './services/eventPollerService';
import { Contract } from './models/contract';
import { ConnectorService } from './services/connectorService';
import { StationService } from './services/stationService';
import { Wallet } from './models/wallet';
import { EventDispatcher } from './models/eventDispatcher';

export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly connectors: ConnectorService;
    public readonly charging: ChargingService;

    constructor(private wallet: Wallet, config, contractDefs) {

        let stationStorageContract = this.getContractInstance(contractDefs, "StationStorage");
        let connectorStorageContract = this.getContractInstance(contractDefs, "ConnectorStorage");
        let chargingContract = this.getContractInstance(contractDefs, "Charging");

        EventPollerService.instance.add(stationStorageContract, events => this.handleNewEvents(events));
        EventPollerService.instance.add(connectorStorageContract, events => this.handleNewEvents(events));
        EventPollerService.instance.add(chargingContract, events => this.handleNewEvents(events));

        this.stations = new StationService(stationStorageContract);
        this.connectors = new ConnectorService(connectorStorageContract);
        this.charging = new ChargingService(chargingContract);
    }

    on(eventName: string, callback: (...args) => void) {
        return this.eventDispatcher.addEventListener(eventName, callback);
    }

    startListening() {
        EventPollerService.instance.start();
    }

    stopListening() {
        EventPollerService.instance.start();
    }

    private handleNewEvents(events: any) {
        events.forEach(item => {
            this.eventDispatcher.dispatchAll(item.event, item.returnValues);
        });
    }

    private getContractInstance(data, name): Contract {
        return null;
    }

}