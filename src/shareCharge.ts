import { ChargingService } from './services/chargingService';
import { EvseService } from './services/evseService';
import { StationService } from './services/stationService';
import { TokenService } from './services/tokenService';
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
    public readonly token: TokenService;

    constructor(@inject(Symbols.StationSerivce) stationService: StationService,
                @inject(Symbols.EvseService) evseService: EvseService,
                @inject(Symbols.ChargingService) chargingService: ChargingService,
                @inject(Symbols.TokenService) tokenService: TokenService,                
                @inject(Symbols.EventPoller) private eventPoller: EventPoller) {
        this.stations = stationService;
        this.evses = evseService;
        this.charging = chargingService;
        this.token = tokenService;

        // EventPoller.instance.monitor('ConnectorStorage', this.connectors.contract);
        eventPoller.monitor('StationStorage', this.stations.contract);
        eventPoller.monitor('EvseStorage', this.evses.contract);
        eventPoller.monitor('Charging', this.charging.contract);
        eventPoller.monitor('MSPToken', this.token.contract);

        eventPoller.events.subscribe(events => events.forEach(item =>
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

    static getInstance(config: any = {}): ShareCharge {
        if (!ShareCharge.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).toConstantValue(new ConfigProvider(config));
            container.bind<IContractProvider>(Symbols.ContractProvider).to(ContractProvider).inSingletonScope();
            container.bind<StationService>(Symbols.StationSerivce).to(StationService).inSingletonScope();
            container.bind<EvseService>(Symbols.EvseService).to(EvseService).inSingletonScope();
            container.bind<ChargingService>(Symbols.ChargingService).to(ChargingService).inSingletonScope();
            container.bind<TokenService>(Symbols.TokenService).to(TokenService).inSingletonScope();
            container.bind<EventPoller>(Symbols.EventPoller).to(EventPoller).inSingletonScope();
            container.bind<ShareCharge>(Symbols.ShareCharge).to(ShareCharge).inSingletonScope();
            ShareCharge.container = container;
        }
        return ShareCharge.container.resolve(ShareCharge);
    }
}
