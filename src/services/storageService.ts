import { Contract } from "../models/contract";
import { ContractProvider } from './contractProvider';
import { IpfsProvider } from './ipfsProvider';
import { Ipfs } from '../models/ipfs';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { Key } from '../models/key';

export class StorageService {

    public readonly contract: Contract;
    public readonly ipfs: Ipfs;

    constructor(private contractProvider: ContractProvider, private ipfsProvider: IpfsProvider) {
        this.contract = this.contractProvider.obtain('ExternalStorage');
        this.ipfs = this.ipfsProvider.obtain();
    }

    get address(): string {
        return this.contract.native.options.address;
    }

    async getLocationById(cpoId: string, locationId: string): Promise<any> {
        const hash = await this.contract.call('getLocationById', cpoId, locationId);
        const data = await this.ipfs.get(hash);
        return ToolKit.decrypt(data, cpoId);
    }

    async getLocationsByCPO(cpoId: string): Promise<{ scId: string, data: any }[]> {
        const scIds = await this.contract.call('getShareAndChargeIdsByCPO', cpoId);
        const promisedLocations: { scId: string, data: any }[] = await scIds.map(async scId => {
            return {
                scId,
                data: await this.getLocationById(cpoId, scId)
            };
        });
        const resolvedLocations = await Promise.all(promisedLocations);
        return resolvedLocations;
    }

    async getTariffsByCPO(cpoId): Promise<any> {
        const hash = await this.contract.call('getTariffsByCPO', cpoId);
        if (hash !== ToolKit.emptyByteString(32)) {
            const data = await this.ipfs.get(hash);
            return ToolKit.decrypt(data, cpoId);
        } else {
            return [];
        }
    }

    useWallet(wallet: Wallet, keyIndex = 0) {
        const key = wallet.keychain[keyIndex];
        return {
            addLocation: this.addLocation(key),
            updateLocation: this.updateLocation(key),
            addTariffs: this.addTariffs(key),
            updateTariffs: this.updateTariffs(key),
            batch: () => {
                return {
                    addLocations: this.batchAddLocation(key),
                };
            }
        };
    }

    private addLocation(key: Key) {
        return async (location: any) => {
            const scId = ToolKit.randomByteString(32);
            const data = ToolKit.encrypt(location, key.address);
            const hash = await this.ipfs.add(data);
            await this.contract.send('addLocation', [scId, hash['solidity']], key);
            return {
                scId,
                ipfs: hash['ipfs']
            };
        };
    }

    private addTariffs(key: Key) {
        return async (tariffs: any) => {
            const data = ToolKit.encrypt(tariffs, key.address);
            const hash = await this.ipfs.add(data);
            await this.contract.send('addTariffs', [hash['solidity']], key);
            return hash['ipfs'];
        };
    }

    private updateLocation(key: Key) {
        return async (scId: string, location: any) => {
            const data = ToolKit.encrypt(location, key.address);
            const hash = await this.ipfs.add(data);
            await this.contract.send('updateLocation', [scId, hash['solidity']], key);
            return {
                scId,
                ipfs: hash['ipfs']
            };
        };
    }

    private updateTariffs(key: Key) {
        return async (tariffs: any) => {
            const data = ToolKit.encrypt(tariffs, key.address);
            const hash = await this.ipfs.add(data);
            await this.contract.send('updateTariffs', [hash['solidity']], key);
            return hash['ipfs'];
        };
    }

    private batchAddLocation(key: Key) {
        return async (...locations: object[]): Promise<{scId: string, ipfs: string}[]> => {
            const batch = this.contract.newBatch();
            key.nonce = await this.contract.getNonce(key);
            const trackedLocations: {scId: string, ipfs: string}[] = [];
            for (const location of locations) {
                const scId = ToolKit.randomByteString(32);
                const data = ToolKit.encrypt(location, key.address);
                const hash = await this.ipfs.add(data);
                const tx = await this.contract.request('addLocation', [scId, hash['solidity']], key);
                batch.add(tx);
                key.nonce++;
                trackedLocations.push({ scId, ipfs: hash['ipfs'] });
            }
            batch.execute();
            return trackedLocations;
        };
    }
}