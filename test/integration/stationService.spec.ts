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
import { StationEventHandler } from '../../src/services/stationEventHandler';
import { StationEvents } from '../../src/models/stationEvents';

describe('StationService', function () {

    const provider = "http://localhost:8545";
    const config = require(process.env["HOME"] + '/.sharecharge/config.json');
    const stationStorage = config['StationStorage'];
    const gasPrice = 18000000000;
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let stationEventHandler, stationService, contract, wallet, coinbase, web3;

    before(async () => {
        web3 = new Web3(provider);
        wallet = new Wallet(seed);

        TestHelper.ensureFunds(web3, wallet);
    });

    beforeEach(async () => {
        const address = await TestHelper.deployContract(web3, stationStorage);
        contract = new Contract(wallet, web3, EventPollerService.instance, stationEventHandler, {
            abi: stationStorage.abi,
            address: address,
            gasPrice
        });

        stationService = new StationService(contract);
    });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
    });

    context('#createStation()', () => {
        it('should create station', async () => {
            const station = new StationBuilder()
                .withOwner(wallet.address)
                .withLatitude(51.345)
                .withLongitude(-0.92332)
                .isAvailable(true)
                .build();

            await stationService.createStation(station);

            const result = await stationService.getStation(station.id);

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

            await stationService.createStation(station);
            await stationService.createStation(station);
            await stationService.createStation(station);

            const result = await stationService.getAllStations();
            expect(result.length).to.equal(3);
        });
    });

    context('#isPersisted()', () => {
        it('should return true for persisted stations', async function () {
            const station = new StationBuilder().withOwner(wallet.address).build();

            await stationService.createStation(station);

            const result = await stationService.isPersisted(station);

            expect(result).to.equal(true);
        });

        it('should return false for unpersisted stations', async function () {
            const station = new StationBuilder().withOwner(wallet.address).build();

            const result = await stationService.isPersisted(station);

            expect(result).to.equal(false);
        });
    });

    context('#on', () => {
        it('should listen to events', async () => {
            let createdId = "";
            let updatedId = "";

            stationEventHandler = new StationEventHandler(EventPollerService.instance, contract);
            stationEventHandler.on(StationEvents.Created, id => createdId = id);
            stationEventHandler.on(StationEvents.Updated, id => updatedId = id);

            const station = new StationBuilder().withOwner(wallet.address).build();
            await stationService.createStation(station);

            const result = await stationService.getStation(station.id);
            result.latitude = 50;

            await stationService.updateStation(result)

            await EventPollerService.instance.poll();

            expect(createdId).to.equal(station.id);
            expect(updatedId).to.equal(station.id);

        });

    });

});

