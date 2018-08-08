import 'mocha';
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
import IpfsMock from '../ipfsMock';
import { ITariff } from '@motionwerk/sharecharge-common/dist/common';

const config = new ConfigProvider();
const ocpiLocation = require('../data/ocpiLocation.json');
const ocpiTariffs = require('../data/ocpiTariffs.json');

describe('StorageService', function () {

    this.timeout(30 * 1000);

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
            const result2 = await storageService.getAllTariffsByCPO(key.address);
            expect(result2['1'].currency).to.equal('EUR');
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

    context('#deleteTariffs()', () => {
        it('should reset tariffs and allow adding again', async () => {
            await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
            await storageService.useWallet(wallet).removeTariffs();
            const tariffs0 = await storageService.getAllTariffsByCPO(wallet.coinbase);
            expect(Object.keys(tariffs0).length).to.equal(0);
            await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
            const tariffs1 = await storageService.getAllTariffsByCPO(wallet.coinbase);
            expect(Object.keys(tariffs1).length).to.equal(1);
        });
    });

    it('should get owner of a registered location', async () => {
        const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
        const owner = await storageService.getOwnerOfLocation(result.scId);
        expect(owner.toLowerCase()).to.equal(wallet.coinbase);
    });

    it('should get evse ids from an scId', async () => {
        const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
        const ids = await storageService.getEvseIds(result.scId);
        expect(ids.length).to.equal(2);
        expect(ids[0]).to.equal('BE-BEC-E041503001');
    });

    it('should get array of all evses from an scId', async () => {
        const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
        const evses = await storageService.getAllEvses(result.scId);
        expect(evses.length).to.equal(2);
        expect(evses[0]['evse_id']).to.equal('BE-BEC-E041503001');
    });

    it('should get a single evse object from an scId', async () => {
        const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
        const evse = await storageService.getEvse(result.scId, 'BE-BEC-E041503001');
        expect(evse['evse_id']).to.equal('BE-BEC-E041503001');
    });

    it('should get tariff of particular ID by CPO', async () => {
        const result = await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
        const tariff = await storageService.getAllTariffsByCPO(wallet.coinbase);
        expect(tariff['1'].currency).to.equal('EUR');
        expect(tariff['2']).to.equal(undefined);
    });

    it('should get serialized tariff if specified', async () => {
        const result = await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
        const tariff = <ITariff[]>await storageService.getAllTariffsByCPO(wallet.coinbase, false);
        expect(tariff.length).to.equal(1);
    });

    it('should get the tariff for an EVSE', async () => {
        const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
        const result2 = await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
        const tariff = await storageService.getTariffByEvse(result.scId, 'BE-BEC-E041503001');
        expect(tariff.currency).to.equal('EUR');
    });

    it('should get tariff of a particular type for an EVSE', async () => {
        const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
        const result2 = await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
        const tariff = await storageService.getTariffByEvse(result.scId, 'BE-BEC-E041503001', 'TIME');
        expect(tariff.currency).to.equal('EUR');
    });

});
