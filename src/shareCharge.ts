import { ChargingService } from './services/chargingService';
import { EvseService } from './services/evseService';
import { StationService } from './services/stationService';
import { EventPoller } from './services/eventPoller';
import { EventDispatcher } from './services/eventDispatcher';
import { ConfigProvider } from './services/configProvider';
import { ContractProvider } from './services/contractProvider';
import { injectable, inject } from "inversify";
import { Symbols } from './symbols';
import "reflect-metadata";

const config = new ConfigProvider();

@injectable()
export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly evses: EvseService;
    public readonly charging: ChargingService;

    constructor(@inject(Symbols.StationSerivce) stationService?: StationService,
                @inject(Symbols.EvseService) evseService?: EvseService,
                @inject(Symbols.ChargingService) chargingService?: ChargingService) {
        this.stations = stationService || new StationService(new ContractProvider(config));
        this.evses = evseService || new EvseService(new ContractProvider(config));
        this.charging = chargingService || new ChargingService(new ContractProvider(config));

        // EventPoller.instance.monitor('ConnectorStorage', this.connectors.contract);
        EventPoller.instance.monitor('StationStorage', this.stations.contract);
        EventPoller.instance.monitor('EvseStorage',  this.evses.contract);
        EventPoller.instance.monitor('Charging',  this.charging.contract);

        EventPoller.instance.notify(events => events.forEach(item =>
            this.eventDispatcher.dispatchAll(item.event, item.returnValues)
        ));
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
