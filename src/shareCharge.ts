import { ChargingService } from './services/chargingService';
import { EvseService } from './services/evseService';
import { StationService } from './services/stationService';
import { Contract } from './models/contract';
import { EventPoller } from './services/eventPoller';
import { EventDispatcher } from './services/eventDispatcher';
import { IDefs } from "./interfaces/iDefs";
import { IServices } from "./interfaces/iServices";
import { IConfig } from "./interfaces/iConfig";
import { ConfigProvider } from './services/configProvider';
import { IContractProvider, ContractProvider } from './services/contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from './symbols';
import "reflect-metadata";

const config = new ConfigProvider();

@injectable()
export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly evses: EvseService;
    public readonly charging: ChargingService;

    constructor(@inject(Symbols.StationSerivce) stationService?,
                @inject(Symbols.EvseService) evseService?,
                @inject(Symbols.ChargingService) chargingService?) {
        this.stations = stationService || new StationService(new ContractProvider(config));
        this.evses = evseService || new EvseService(new ContractProvider(config));
        this.charging = chargingService || new ChargingService(new ContractProvider(config));

        EventPoller.instance.notify(events => events.forEach(item =>
            this.eventDispatcher.dispatchAll(item.event, item.returnValues)
        ));
    }

    async hookup() {
        // EventPoller.instance.monitor('ConnectorStorage', this._resolved);
        EventPoller.instance.monitor('StationStorage', await this.stations.contract());
        EventPoller.instance.monitor('EvseStorage', await this.evses.contract());
        EventPoller.instance.monitor('Charging', await this.charging.contract());
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
}
