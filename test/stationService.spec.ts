import { StationEventHandler } from './../src/services/stationEventHandler';
import { StationEvents } from './../src/models/stationEvents';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';
import { StationService } from '../src/services/stationService';
import { Helper } from './helpers';
import { Wallet } from '../src/models/wallet';
import { Contract } from '../src/models/contract';
import { EventPollerService } from '../src/services/eventPollerService';
const Web3 = require('web3');

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

        Helper.ensureFunds(web3, wallet);
    });

    beforeEach(async () => {
        const address = await Helper.deployContract(web3, stationStorage);
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
            const owner = wallet.address;

            const id = await stationService.createStation({
                owner: wallet.address,
                latitude: 51.345,
                longitude: -0.92332,
                openingHours: "123455677"
            });
            const station = await stationService.getStation(id);
            expect(station.id).to.not.equal(undefined);
            expect(station.owner.toLowerCase()).to.equal(owner.toLowerCase());
            expect(station.latitude).to.equal(51.345);
            expect(station.longitude).to.equal(-0.92332);
            expect(station.openingHours).to.equal("123455677");
            expect(station.enabled).to.equal(true);
        });
    });

    context('#getAllStations()', () => {
        it('return all stations', async function () {
            const payload = {
                owner: wallet.address,
                latitude: 50.345,
                longitude: 41.92332,
                openingHours: ""
            };
            const id1 = await stationService.createStation(payload);
            const id2 = await stationService.createStation(payload);
            const id3 = await stationService.createStation(payload);
            const stations = await stationService.getAllStations();
            expect(stations.length).to.equal(3);
        });

    });

    context('#on', () => {
        it('should listen to events', async () => {
            let createdId = "";
            let updatedId = "";
            let disabledId = "";
            let enabledId = "";

            stationEventHandler = new StationEventHandler(EventPollerService.instance, contract);
            stationEventHandler.on(StationEvents.Created, id => createdId = id);
            stationEventHandler.on(StationEvents.Updated, id => updatedId = id);

            const id = await stationService.createStation({
                owner: wallet.address,
                latitude: 10,
                longitude: 0,
                openingHours: ""
            });

            const station = await stationService.getStation(id);
            station.latitude = 50;

            await stationService.updateStation(station)

            await EventPollerService.instance.poll();

            expect(createdId).to.equal(id);
            expect(updatedId).to.equal(id);

        });

    });

});

