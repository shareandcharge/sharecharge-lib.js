import { ChargingService } from './services/chargingService';
import { EvseService } from './services/evseService';
import { StationService } from './services/stationService';
import { TokenService } from './services/tokenService';
import { EventPoller } from './services/eventPoller';
import { EventDispatcher } from './services/eventDispatcher';
import { ConfigProvider } from './services/configProvider';
import { ContractProvider } from './services/contractProvider';
import { StorageService } from './services/storageService';
import { IpfsProvider } from './services/ipfsProvider';

export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();

    public readonly stations: StationService;
    public readonly evses: EvseService;
    public readonly charging: ChargingService;
    public readonly token: TokenService;
    public readonly store: StorageService;

    constructor(stationService: StationService,
                evseService: EvseService,
                chargingService: ChargingService,
                tokenService: TokenService,
                storageService: StorageService,
                private eventPoller: EventPoller) {
        this.stations = stationService;
        this.evses = evseService;
        this.charging = chargingService;
        this.token = tokenService;
        this.store = storageService;

        // EventPoller.instance.monitor('ConnectorStorage', this.connectors.contract);
        eventPoller.monitor('StationStorage', this.stations.contract);
        eventPoller.monitor('EvseStorage', this.evses.contract);
        eventPoller.monitor('Charging', this.charging.contract);
        eventPoller.monitor('MSPToken', this.token.contract);
        eventPoller.monitor('ExternalStorage', this.store.contract);

        eventPoller.events.subscribe(events => events.forEach(item => {
            const returnValues = {
                ...item.returnValues,
                transactionHash: item.transactionHash,
                blockNumber: item.blockNumber,
                address: item.address,
                timestamp: Date.now()
            };
            this.eventDispatcher.dispatchAll(item.event, returnValues);
        }
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

    private static instance;
    static getInstance(config: any = {}): ShareCharge {
        if (!ShareCharge.instance) {
            const configProvider = new ConfigProvider(config);
            const contractProvider = new ContractProvider(configProvider);
            const ipfsProvider = new IpfsProvider(configProvider);
            const eventPoller = new EventPoller(configProvider);
            const stationService = new StationService(contractProvider);
            const evseService = new EvseService(contractProvider);
            const chargingService = new ChargingService(contractProvider);
            const tokenService = new TokenService(contractProvider);
            const storageService = new StorageService(contractProvider, ipfsProvider);
            ShareCharge.instance = new ShareCharge(stationService, evseService, chargingService, tokenService, storageService, eventPoller);
        }
        return ShareCharge.instance;
    }
}
