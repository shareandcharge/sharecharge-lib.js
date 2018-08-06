import { ILocation, IEvse, ITariff } from '@motionwerk/sharecharge-common';
import { Tariff } from '../models/tariff';
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
     * @param scId the unique Share & Charge location identity
     * @returns charge point (location) object in OCPI(?) format
     */
    async getLocationById(cpoId: string, scId: string): Promise<ILocation> {
        const hash = await this.contract.call('getLocationById', cpoId, scId);
        if (hash !== ToolKit.emptyByteString(32)) {
            return this.ipfs.cat(hash);
        } else {
            throw Error('Location does not exist!');
        }

    }

    /**
     * Get Share & Charge location IDs for a specific CPO
     * @param cpoId the identity (address) of the Charge Point Operator
     * @returns array of Share & Charge location IDs
     */
    async getIdsByCPO(cpoId: string): Promise<string[]> {
        const ids: string[] = await this.contract.call('getShareAndChargeIdsByCPO', cpoId);
        const uniqueIds = new Set(ids);
        const extantIds: string[] = [];
        for (const id of Array.from(uniqueIds)) {
            const hash = await this.contract.call('getLocationById', cpoId, id);
            if (hash !== ToolKit.emptyByteString(32)) {
                extantIds.push(ToolKit.hexToScId(id));
            }
        }
        return extantIds;
    }

    /**
     * Get all locations (charge points) belonging to a specific Charge Point Operator
     * @param cpoId the identity (address) of the Charge Point Operator
     * @returns array of objects containing the Share & Charge ID for the Charge Point and its data
     */
    async getLocationsByCPO(cpoId: string): Promise<{ scId: string, data: ILocation }[]> {
        const scIds: string[] = await this.contract.call('getShareAndChargeIdsByCPO', cpoId);
        const uniqueIds = new Set(scIds);
        const resolvedLocations: { scId: string, data: any }[] = [];
        for (const scId of Array.from(uniqueIds)) {
            try {
                const data = await this.getLocationById(cpoId, scId);
                if (data) {
                    resolvedLocations.push({
                        scId: ToolKit.hexToScId(scId),
                        data
                    });
                }
            } catch (err) {
            }
        }

        return resolvedLocations;
    }

    /**
     * Get the owner of a particular location by its ID
     * @param scId the unique Share & Charge location identifier
     * @returns owner address of the location
     */
    async getOwnerOfLocation(scId: string): Promise<string> {
        const owner = await this.contract.call('ownerOf', scId);
        return owner;
    }

    /**
     * Find the EVSEs on a location
     * @param scId the unique Share & Charge location identifier
     * @returns array of EVSE IDs on the location
     */
    async getEvseIds(scId: string): Promise<string[]> {
        const owner = await this.getOwnerOfLocation(scId);
        const location = await this.getLocationById(owner, scId);
        try {
            return location.evses.map(evse => evse['evse_id']);
        } catch (err) {
            throw Error('Unable to parse location for EVSE ids. Ensure your location data is in OCPI format.');
        }
    }

    /**
     * Find EVSEs within a location
     * @param scId the unique Share & Charge location identifier
     * @returns array of EVSE objects
     */
    async getAllEvses(scId: string): Promise<IEvse[]> {
        const owner = await this.getOwnerOfLocation(scId);
        const location = await this.getLocationById(owner, scId);
        try {
            return location.evses;
        } catch (err) {
            throw Error('Unable to parse location for EVSEs. Ensure your location data is in OCPI format.');
        }
    }

    /**
     * Obtain an EVSE object from a location
     * @param scId the unique Share & Charge location identifier
     * @param evseId the ID of the EVSE to obtain
     * @returns EVSE object
     */
    async getEvse(scId: string, evseId: string): Promise<IEvse> {
        const owner = await this.getOwnerOfLocation(scId);
        const location = await this.getLocationById(owner, scId);
        try {
            return location.evses.filter(evse => evse['evse_id'] === evseId)[0];
        } catch (err) {
            throw Error('Unable to parse location for EVSEs. Ensure your location data is in OCPI format.');
        }
    }

    /**
     * Get tariffs data belonging to a sepcific Charge Point Operator
     * @param cpoId the identity (address) of the Charge Point Operator which owns the Charge Point
     * @param deserialize choose whether to return the raw OCPI tariffs array or a deserialized tariffs object
     * @returns array of tariff objects or single tariff object if filtered by tariff ID
     */
    async getAllTariffsByCPO(cpoId: string, deserialize = true): Promise<{ [key: string]: Tariff } | ITariff[]> {
        const hash = await this.contract.call('getTariffsByCPO', cpoId);
        if (hash !== ToolKit.emptyByteString(32)) {
            const data = await this.ipfs.cat(hash);
            if (deserialize) {
                return Tariff.deserialize(data);
            } else {
                return data;
            }
        } else {
            return {};
        }
    }

    /**
     * Get tariffs relating to a certain EVSE
     * @param scId the unique Share & Charge location identifier
     * @param evseId the EVSE ID to get tariffs for
     * @param type optional type of tariff to get (ENERGY, TIME, PARKING_TIME, or FLAT)
     * @returns filtered or unfiltered tariff object
     */
    async getTariffByEvse(scId: string, evseId: string, type?: string): Promise<Tariff> {
        const owner = await this.getOwnerOfLocation(scId);
        const evse = await this.getEvse(scId, evseId);
        const tariffId = evse.connectors.map(conn => conn['tariff_id'])[0];
        const tariffs = await this.getAllTariffsByCPO(owner);
        return tariffs[tariffId];
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
             * Remove the location data of a specific Share & Charge location
             * @param scId the unique Share & Charge location identity
             * @returns object containing the unique Share & Charge ID of the location
             */
            removeLocation: this.removeLocation(key),

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
        };
    }

    private addLocation(key: Key) {
        return async (location: ILocation) => {
            const scId = ToolKit.geolocationToScId(location.coordinates);
            const hash = await this.ipfs.add(location);
            await this.contract.send('addLocation', [scId, hash['solidity']], key);
            return {
                scId,
                ipfs: hash['ipfs']
            };
        };
    }

    private removeLocation(key: Key) {
        return async (scId: string) => {
            await this.contract.send('updateLocation', [scId, ToolKit.emptyByteString(32)], key);
            return {
                scId
            };
        };
    }

    private addTariffs(key: Key) {
        return async (tariffs: ITariff) => {
            const hash = await this.ipfs.add(tariffs);
            await this.contract.send('addTariffs', [hash['solidity']], key);
            return hash['ipfs'];
        };
    }

    private updateLocation(key: Key) {
        return async (scId: string, location: ILocation) => {
            const hash = await this.ipfs.add(location);
            await this.contract.send('updateLocation', [scId, hash['solidity']], key);
            return {
                scId,
                ipfs: hash['ipfs']
            };
        };
    }

    private updateTariffs(key: Key) {
        return async (tariffs: ITariff) => {
            const hash = await this.ipfs.add(tariffs);
            await this.contract.send('updateTariffs', [hash['solidity']], key);
            return hash['ipfs'];
        };
    }
}