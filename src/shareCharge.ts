import { ChargingService } from './services/chargingService';
import { ConnectorService } from './services/connectorService';
import { StationService } from './services/stationService';
import { Contract } from './models/contract';
import { EventPollerService } from './services/eventPollerService';
import { EventDispatcher } from './models/eventDispatcher';
import { IDefs } from "./interfaces/iDefs";
import { IServices } from "./interfaces/iServices";
import { IConfig } from "./interfaces/iConfig";
import { loadContractDefs } from "./utils/defsLoader";

const Web3 = require('web3');

export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly connectors: ConnectorService;
    public readonly charging: ChargingService;

    private readonly web3;

    constructor(private config: IConfig, preloaded?: IDefs | IServices) {

        this.web3 = new Web3(config.provider);

        if ((<IServices>preloaded)) {
            // we got preloaded services, use them
            this.stations = (<IServices>preloaded).StationService;
            this.connectors = (<IServices>preloaded).ConnectorService;
            this.charging = (<IServices>preloaded).ChargingService;
        } else {
            // we didnt get preloaded services, load them from defs
            // either the preloaded ones or load them from on our own
            const defs = <IDefs>preloaded ? <IDefs>preloaded : loadContractDefs(config.stage);

            this.stations = new StationService(this.getContractInstance(defs, 'StationStorage'));
            this.connectors = new ConnectorService(this.getContractInstance(defs, 'ConnectorStorage'));
            this.charging = new ChargingService(this.getContractInstance(defs, 'Charging'));
        }

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

    private getContractInstance(defs, name): Contract {
        const contractDef = defs[name];
        return new Contract(this.web3, {
            abi: contractDef.abi,
            address: contractDef.address,
            gasPrice: this.config.gasPrice
        });
    }

}