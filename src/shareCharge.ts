import { ChargingService } from './services/chargingService';
import { EvseService } from './services/evseService';
import { StationService } from './services/stationService';
import { Contract } from './models/contract';
import { EventPoller } from './services/eventPoller';
import { EventDispatcher } from './models/eventDispatcher';
import { IDefs } from "./interfaces/iDefs";
import { IServices } from "./interfaces/iServices";
import { IConfig } from "./interfaces/iConfig";
import { ConfigProvider } from './services/configProvider';
import { IContractProvider, ContractProvider } from './services/contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from './models/symbols';
import "reflect-metadata";


const Web3 = require('web3');

@injectable()
export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly evses: EvseService;
    public readonly charging: ChargingService;

    constructor(@inject(Symbols.StationSerivce) stationService,
                @inject(Symbols.EvseService) evseService,
                @inject(Symbols.ChargingService) chargingService) {
        this.stations = stationService;
        this.evses = evseService;
        this.charging = chargingService;
    }

    async hookup() {
        EventPoller.instance.add(await this.stations.contract(), events => this.handleNewEvents(events));
        EventPoller.instance.add(await this.evses.contract(), events => this.handleNewEvents(events));
        EventPoller.instance.add(await this.charging.contract(), events => this.handleNewEvents(events));
    }

    on(eventName: string, callback: (...args) => void) {
        return this.eventDispatcher.addEventListener(eventName, callback);
    }

    startListening() {
        EventPoller.instance.start();
    }

    stopListening() {
        EventPoller.instance.stop();
    }

    private handleNewEvents(events: any) {
        events.forEach(item => {
            this.eventDispatcher.dispatchAll(item.event, item.returnValues);
        });
    }
}
