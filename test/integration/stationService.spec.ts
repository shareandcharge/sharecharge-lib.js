import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { StationBuilder } from '../stationBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPoller } from '../../src/services/eventPoller';
import { StationService } from '../../src/services/stationService';
import { config } from "../../src/utils/config";
import { ToolKit } from './../../src/utils/toolKit';
import { IContractProvider } from './../../src/services/contractProvider';

describe('StationService', function () {

    this.timeout(10 * 1000);

    const defs = ToolKit.contractDefsForStage(config.stage);
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let stationService: StationService, wallet: Wallet, web3;

    before(async () => {
        web3 = new Web3(config.provider);
        wallet = new Wallet(seed);

        await TestHelper.ensureFunds(web3, wallet);
    });

    beforeEach(async () => {
        const testContractProvider = TestHelper.getTestContractProvider(web3, config, defs);
        stationService = new StationService(testContractProvider);
    });

    afterEach(async () => {
        EventPoller.instance.removeAll();
    });

    context('#create()', () => {
        it('should create station', async () => {
            const station = new StationBuilder()
                .withOwner(wallet.address)
                .withLatitude(51.345)
                .withLongitude(-0.92332)
                .build();

            await stationService.useWallet(wallet).create(station);

            const result = await stationService.getById(station.id);

            expect(result.id).to.not.equal(undefined);
            expect(result.owner.toLowerCase()).to.equal(station.owner.toLowerCase());
            expect(result.latitude).to.equal(station.latitude);
            expect(result.longitude).to.equal(station.longitude);
            expect(result.openingHours.toString()).to.equal(station.openingHours.toString());
        });
    });

    context('#getAllStations()', () => {
        it('return all stations', async function () {
            const station = new StationBuilder().withOwner(wallet.address).build();

            await stationService.useWallet(wallet).create(station);
            await stationService.useWallet(wallet).create(station);
            await stationService.useWallet(wallet).create(station);

            const result = await stationService.getAll();
            expect(result.length).to.equal(3);
        });
    });

    context('#isPersisted()', () => {
        it('should return true for persisted stations', async function () {
            const station = new StationBuilder().withOwner(wallet.address).build();

            await stationService.useWallet(wallet).create(station);

            const result = await stationService.isPersisted(station);

            expect(result).to.equal(true);
        });

        it('should return false for unpersisted stations', async function () {
            const station = new StationBuilder().withOwner(wallet.address).build();

            const result = await stationService.isPersisted(station);

            expect(result).to.equal(false);
        });
    });

});

