import { IEventPoller } from './interfaces/iEventPoller';
import { ChargingService } from './services/chargingService';
import { EvseService } from './services/evseService';
import { StationService } from './services/stationService';
import { EventPoller } from './services/eventPoller';
import { EventDispatcher } from './services/eventDispatcher';
import { ConfigProvider } from './services/configProvider';
import { ContractProvider, IContractProvider } from './services/contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from './symbols';
import "reflect-metadata";

@injectable()
export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly evses: EvseService;
    public readonly charging: ChargingService;

    constructor(@inject(Symbols.StationSerivce) stationService: StationService,
                @inject(Symbols.EvseService) evseService: EvseService,
                @inject(Symbols.ChargingService) chargingService: ChargingService,
                @inject(Symbols.EventPoller) private eventPoller: IEventPoller) {
        this.stations = stationService;
        this.evses = evseService;
        this.charging = chargingService;

        // EventPoller.instance.monitor('ConnectorStorage', this.connectors.contract);
        eventPoller.monitor('StationStorage', this.stations.contract);
        eventPoller.monitor('EvseStorage', this.evses.contract);
        eventPoller.monitor('Charging', this.charging.contract);

        eventPoller.notify(events => events.forEach(item =>
            this.eventDispatcher.dispatchAll(item.event, item.returnValues)
        ));
    }

    on(eventName: string, callback: (...args) => void) {
        return this.eventDispatcher.addEventListener(eventName, callback);
    }

    startListening() {
        this.eventPoller.start();
    }

    stopListening() {
        this.eventPoller.stop();
    }

    private static container;

    static getInstance(): ShareCharge {
        if (!ShareCharge.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider).inSingletonScope();
            container.bind<IContractProvider>(Symbols.ContractProvider).to(ContractProvider).inSingletonScope();
            container.bind<StationService>(Symbols.StationSerivce).to(StationService).inSingletonScope();
            container.bind<EvseService>(Symbols.EvseService).to(EvseService).inSingletonScope();
            container.bind<ChargingService>(Symbols.ChargingService).to(ChargingService).inSingletonScope();
            container.bind<IEventPoller>(Symbols.EventPoller).to(EventPoller).inSingletonScope();
            container.bind<ShareCharge>(Symbols.ShareCharge).to(ShareCharge).inSingletonScope();
            ShareCharge.container = container;
        }
        return ShareCharge.container.resolve(ShareCharge);
    }
}
