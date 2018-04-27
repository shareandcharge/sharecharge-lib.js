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

    async getLocationById(cpoID: string, locationID: string): Promise<any> {
        const hash = await this.contract.call('getLocationById', cpoID, locationID);
        return this.ipfs.get(hash);
    }

    async getLocationsByCPO(cpoID: string): Promise<object[]> {
        const locationIDs = await this.contract.call('getGlobalIDsByCPO', cpoID);
        const promisedLocations = await locationIDs.map(async locationID => {
            return this.getLocationById(cpoID, locationID);
        });
        const resolvedLocations = await Promise.all(promisedLocations);
        return resolvedLocations;
    }

    useWallet(wallet: Wallet, keyIndex = 0) {
        const key = wallet.keychain[keyIndex];
        return {
            addLocation: this.addLocation(key),
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
            const hash = await this.ipfs.add(location);
            await this.contract.send('addLocation', [globalId, hash['solidity']], key);
            return {
                globalId,
                ipfs: hash['hash']
            };
        };
    }

    private batchAddLocation(key: Key) {
        return async (...locations: object[]): Promise<{id: string, ipfs: string}[]> => {
            const batch = this.contract.newBatch();
            key.nonce = await this.contract.getNonce(key);
            const trackedLocations: {id: string, ipfs: string}[] = [];
            for (const location of locations) {
                const id = ToolKit.randomBytes32String();
                const hash = await this.ipfs.add(location);
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