import { ChargingService } from './services/chargingService';
import { TokenService } from './services/tokenService';
import { EventPoller } from './services/eventPoller';
import { EventDispatcher } from './services/eventDispatcher';
import { ConfigProvider } from './services/configProvider';
import { ContractProvider } from './services/contractProvider';
import { StorageService } from './services/storageService';
import { IpfsProvider } from './services/ipfsProvider';
import { ToolKit } from './utils/toolKit';

/**
 * Share & Charge eMobility Network functionality
 */
export class ShareCharge {

    private eventDispatcher = new EventDispatcher<string>();
    private _isListening: boolean;

    /**
     * Access Share & Charge charging functionality
     */
    public readonly charging: ChargingService;

    /**
     * Access eMobility Service Provider token functionality
     */
    public readonly token: TokenService;

    /**
     * Access Share & Charge storage functionality
     */
    public readonly store: StorageService;

    constructor(chargingService: ChargingService,
                tokenService: TokenService,
                storageService: StorageService,
                private eventPoller: EventPoller) {
        this.charging = chargingService;
        this.token = tokenService;
        this.store = storageService;

        eventPoller.monitor('Charging', this.charging.contract);
        eventPoller.monitor('MSPToken', this.token.contract);
        eventPoller.monitor('ExternalStorage', this.store.contract);

        eventPoller.events.subscribe(events => events.forEach(item => {
            item.returnValues = ToolKit.formatReturnValues(item.returnValues);
            const returnValues = {
                ...ToolKit.removeIndexKeys(item.returnValues),
                transactionHash: item.transactionHash,
                blockNumber: item.blockNumber,
                address: item.address,
                timestamp: Date.now()
            };
            this.eventDispatcher.dispatchAll(item.event, returnValues);
        }
        ));

        this._isListening = false;
    }

    /**
     * Subscribe to Share & Charge Network events (event listener should be running)
     * @param eventName the event to subscribe to
     * @param callback event handler function
     */
    on(eventName: string, callback: (...args) => void) {
        return this.eventDispatcher.addEventListener(eventName, callback);
    }

    /**
     * Start the event listener
     */
    startListening() {
        this.eventPoller.start();
        this._isListening = true;
    }

    /**
     * Stop the event listener
     */
    stopListening() {
        this.eventPoller.stop();
        this._isListening = false;
    }

    /**
     * Check event listener is running
     */
    get isListening(): boolean {
        return this._isListening;
    }

    private static instance;

    /**
     * Get instance of ShareCharge class
     * @param config optional configuration parameters
     * @returns ShareCharge object
     */
    static getInstance(config: any = {}): ShareCharge {
        if (!ShareCharge.instance) {
            const configProvider = new ConfigProvider(config);
            const contractProvider = new ContractProvider(configProvider);
            const ipfsProvider = new IpfsProvider(configProvider);
            const eventPoller = new EventPoller(configProvider);
            const chargingService = new ChargingService(contractProvider);
            const tokenService = new TokenService(contractProvider);
            const storageService = new StorageService(contractProvider, ipfsProvider);
            ShareCharge.instance = new ShareCharge(chargingService, tokenService, storageService, eventPoller);
        }
        return ShareCharge.instance;
    }
}
