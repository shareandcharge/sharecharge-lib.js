import { Contract } from "../models/contract";
import { ContractProvider } from './contractProvider';
import { IpfsProvider } from './ipfsProvider';
import { Ipfs } from '../models/ipfs';
import { ToolKit } from '../utils/toolKit';
import { Wallet } from '../models/wallet';
import { Key } from '../models/key';

export class StorageService {

    /**
     * Access to generic contract functions (e.g. getLogs)
     */
    public readonly contract: Contract;

    private readonly ipfs: Ipfs;

    constructor(private contractProvider: ContractProvider, private ipfsProvider: IpfsProvider) {
        this.contract = this.contractProvider.obtain('ExternalStorage');
        this.ipfs = this.ipfsProvider.obtain();
    }

    /**
     * Get the Storage contract address for the current stage
     */
    get address(): string {
        return this.contract.native.options.address;
    }

    /**
     * Get location (charge point) data based on its unique Share & Charge location identity
     * @param cpoId the identity (address) of the Charge Point Operator which owns the Charge Point
     * @param locationId the unique Share & Charge location identity
     * @returns charge point (location) object in OCPI(?) format
     */
    async getLocationById(cpoId: string, scId: string): Promise<any> {
        const hash = await this.contract.call('getLocationById', cpoId, scId);
        const data = await this.ipfs.cat(hash);
        return ToolKit.decrypt(data, cpoId);
    }

    /**
     * Get Share & Charge location IDs for a specific CPO
     * @param cpoId the identity (address) of the Charge Point Operator
     * @returns array of Share & Charge location IDs
     */
    async getIdsByCPO(cpoId: string): Promise<string[]> {
        return this.contract.call('getShareAndChargeIdsByCPO', cpoId);
    }

    /**
     * Get all locations (charge points) belonging to a specific Charge Point Operator
     * @param cpoId the identity (address) of the Charge Point Operator
     * @returns array of objects containing the Share & Charge ID for the Charge Point and its data
     */
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

    /**
     * Get tariffs data belonging to a sepcific Charge Point Operator
     * @param cpoId the identity (address) of the Charge Point Operator which owns the Charge Point
     * @returns tariffs data object
     */
    async getTariffsByCPO(cpoId): Promise<any> {
        const hash = await this.contract.call('getTariffsByCPO', cpoId);
        if (hash !== ToolKit.emptyByteString(32)) {
            const data = await this.ipfs.cat(hash);
            return ToolKit.decrypt(data, cpoId);
        } else {
            return [];
        }
    }

    /**
     * Specify a wallet to use for a transaction
     * @param wallet the Wallet object to use
     * @param keyIndex the index of the key containing the private key which will sign the transaction [default: 0]
     */
    useWallet(wallet: Wallet, keyIndex = 0) {
        const key = wallet.keychain[keyIndex];
        return {

            /**
             * Add a location (charge point) to the Share & Charge Network
             * @param location the location (charge point) data to add
             * @returns object containing the unique Share & Charge ID of the location and its ipfs hash
             */
            addLocation: this.addLocation(key),

            /**
             * Update the location data of a specific Share & Charge location
             * @param scId the unique Share & Charge location identity
             * @param location the updated location (charge point) data
             * @returns object containing the unique Share & Charge ID of the location and its ipfs hash
             */
            updateLocation: this.updateLocation(key),

            /**
             * Add tariffs data to the Share & Charge Network
             * @param tariffs the tariffs data to add
             * @returns the ipfs hash of the tariffs data
             */
            addTariffs: this.addTariffs(key),

            /**
             * Update tariffs data on the Share & Charge Network
             * @param tariffs the updated tariffs data
             * @returns the ipfs hash of the new tariffs data
             */
            updateTariffs: this.updateTariffs(key),

            /**
             * Access to batch methods
             */
            batch: () => {
                return {
                    /**
                     * Add locations to the Share & Charge Network
                     * @param locations location objects separated by commas
                     * @returns array of objects containing unique Share & Charge location identities and their respective ipfs hashes
                     */
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