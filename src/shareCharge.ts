import { ChargingService } from './services/chargingService';
import { ConnectorService } from './services/connectorService';
import { StationService } from './services/stationService';
import { Wallet } from './models/wallet';
import { Contract } from './models/contract';
import { EventPollerService } from './services/eventPollerService';
import { EventDispatcher } from './models/eventDispatcher';

const Web3 = require('web3');

export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly connectors: ConnectorService;
    public readonly charging: ChargingService;

    private web3;

    constructor(private config, private contractDefs) {
        this.web3 = new Web3(config.provider);

        this.stations = new StationService(this.getContractInstance('StationStorage'));
        this.connectors = new ConnectorService(this.getContractInstance('ConnectorStorage'));
        this.charging = new ChargingService(this.getContractInstance('Charging'));

        EventPollerService.instance.add(this.stations.contract, events => this.handleNewEvents(events));
        EventPollerService.instance.add(this.connectors.contract, events => this.handleNewEvents(events));
        EventPollerService.instance.add(this.charging.contract, events => this.handleNewEvents(events));
    }

    on(eventName: string, callback: (...args) => void) {
        return this.eventDispatcher.addEventListener(eventName, callback);
    }

    startListening() {
        EventPollerService.instance.start();
    }

    stopListening() {
        EventPollerService.instance.stop();
    }

    private handleNewEvents(events: any) {
        events.forEach(item => {
            this.eventDispatcher.dispatchAll(item.event, item.returnValues);
        });
    }

    private getContractInstance(name): Contract {
        const contractDef = this.contractDefs[name];
        return new Contract(this.web3, {
            abi: contractDef.abi,
            address: contractDef.address,
            gasPrice: this.config.gasPrice
        });
    }

}