import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { StationBuilder } from '../stationBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPollerService } from '../../src/services/eventPollerService';
import { StationService } from '../../src/services/stationService';
import { loadContractDefs } from "../../src/utils/defsLoader";
import { config } from "../../src/utils/config";

describe('StationService', function () {

    this.timeout(10 * 1000);

    const contractDefs = loadContractDefs(config.stage);
    const stationStorage = contractDefs['StationStorage'];
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let stationService, contract, wallet, web3;

    before(async () => {
        web3 = new Web3(config.provider);
        wallet = new Wallet(seed);

        await TestHelper.ensureFunds(web3, wallet);
    });

    beforeEach(async () => {
        const address = await TestHelper.deployContract(web3, stationStorage);
        contract = new Contract(web3, {
            abi: stationStorage.abi,
            address: address,
            gasPrice: config.gasPrice
        });

        stationService = new StationService(contract);
    });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
    });

    context('#create()', () => {
        it('should create station', async () => {
            const station = new StationBuilder()
                .withOwner(wallet.address)
                .withLatitude(51.345)
                .withLongitude(-0.92332)
                .isAvailable(true)
                .build();

            await stationService.useWallet(wallet).create(station);

            const result = await stationService.getById(station.id);

            expect(result.id).to.not.equal(undefined);
            expect(result.owner.toLowerCase()).to.equal(station.owner.toLowerCase());
            expect(result.latitude).to.equal(station.latitude);
            expect(result.longitude).to.equal(station.longitude);
            expect(result.openingHours).to.equal(station.openingHours);
            expect(result.available).to.equal(station.available);
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

