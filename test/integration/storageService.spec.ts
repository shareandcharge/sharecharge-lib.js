import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { ConfigProvider } from "../../src/services/configProvider";
import { ToolKit } from '../../src/utils/toolKit';
import { Key } from '../../src/models/key';
import { ContractProvider } from '../../src/services/contractProvider';
import { StorageService } from '../../src/services/storageService';
import { IpfsProvider } from '../../src/services/ipfsProvider';
import { Ipfs } from '../../src/models/ipfs';
import IpfsMock from '../ipfsMock';

const config = new ConfigProvider();
const ocpiLocation = require('../data/ocpiLocation.json');
const ocpiTariffs = require('../data/ocpiTariffs.json');

describe('StorageService', function () {

    this.timeout(10 * 1000);
    const batchTimeout = 500;

    let storageService: StorageService, wallet: Wallet, key: Key, web3;

    const defs = ToolKit.contractDefsForStage(config.stage);
    const seed = 'filter march urge naive sauce distance under copy payment slow just warm';


    before(async () => {
        web3 = new Web3(config.ethProvider);
        wallet = new Wallet(seed);
        key = wallet.keychain[0];
        await TestHelper.ensureFunds(web3, key);
    });

    beforeEach(async () => {
        const contract = await TestHelper.createContract(web3, config, defs["ExternalStorage"]);
        storageService = new StorageService(
            <ContractProvider>{
                obtain(key: string): Contract {
                    return contract;
                }
            }, <IpfsProvider>IpfsMock
        );
    });

    context('#addLocation()', () => {
        it('should add location to storage', async () => {
            const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
            const scIds = await storageService.getIdsByCPO(key.address);
            const location = await storageService.getLocationById(key.address, result.scId);
            expect(scIds.length).to.equal(1);
            expect(scIds[0]).to.equal(result.scId);
            expect(location.id).to.equal(ocpiLocation.id);
        });

        it('should bulk add locations', async () => {
            const locs: any[] = [];
            for (let i = 0; i < 10; i++) {
                locs[i] = ocpiLocation;
            }
            const ids = await storageService.useWallet(wallet).batch().addLocations(...locs);
            expect(ids.length).to.equal(10);
            const storedLocations = await storageService.getLocationsByCPO(key.address);
            expect(storedLocations.length).to.equal(10);
        });

    });

    context('#updateLocation()', () => {
        it('should update location in storage', async () => {
            const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
            ocpiLocation.id = 'LOC2';
            const result2 = await storageService.useWallet(wallet).updateLocation(result.scId, ocpiLocation);
            expect(result2.scId).to.equal(result.scId);
            expect(result2.ipfs).to.not.equal(undefined);
        });
    });

    context('#addTariffs()', () => {
        it('should add tariffs to storage', async () => {
            const result = await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
            expect(result).to.not.equal(undefined);
            const result2 = await storageService.getTariffsByCPO(key.address);
            expect(result2['id']).to.not.equal(undefined);
        });
    });

    context('#updateTariffs()', () => {
        it('should update tariffs in storage', async () => {
            await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
            ocpiTariffs.id = '12';
            const result = await storageService.useWallet(wallet).updateTariffs(ocpiTariffs);
            expect(result).to.not.equal(undefined);
        });
    });

    it('should get owner of a registered location', async () => {
        const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
        const owner = await storageService.getOwnerOfLocation(result.scId);
        expect(owner.toLowerCase()).to.equal(wallet.coinbase);
    });

});
