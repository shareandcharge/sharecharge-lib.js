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

    async getLocationsByCPO(cpoId: string): Promise<object[]> {
        const locationIds = await this.contract.call('getGlobalIdsByCPO', cpoId);
        const promisedLocations = await locationIds.map(async locationID => {
            return this.getLocationById(cpoId, locationID);
        });
        const resolvedLocations = await Promise.all(promisedLocations);
        return resolvedLocations;
    }

    async getTariffsByCPO(cpoId): Promise<any> {
        const hash = await this.contract.call('getTariffsByCPO', cpoId);
        const data = await this.ipfs.get(hash);
        return ToolKit.decrypt(data, cpoId);
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
            const globalId = ToolKit.randomBytes32String();
            const data = ToolKit.encrypt(location, key.address);
            const hash = await this.ipfs.add(data);
            await this.contract.send('addLocation', [globalId, hash['solidity']], key);
            return {
                globalId,
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
        return async (globalId: string, location: any) => {
            const data = ToolKit.encrypt(location, key.address);
            const hash = await this.ipfs.add(data);
            await this.contract.send('updateLocation', [globalId, hash['solidity']], key);
            return {
                globalId,
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
        return async (...locations: object[]): Promise<{id: string, ipfs: string}[]> => {
            const batch = this.contract.newBatch();
            key.nonce = await this.contract.getNonce(key);
            const trackedLocations: {id: string, ipfs: string}[] = [];
            for (const location of locations) {
                const id = ToolKit.randomBytes32String();
                const data = ToolKit.encrypt(location, key.address);
                const hash = await this.ipfs.add(data);
                const tx = await this.contract.request('addLocation', [id, hash['solidity']], key);
                batch.add(tx);
                key.nonce++;
                trackedLocations.push({ id, ipfs: hash['ipfs'] });
            }
            batch.execute();
            return trackedLocations;
        };
    }
}