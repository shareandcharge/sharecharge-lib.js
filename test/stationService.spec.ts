import { expect } from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { StationService } from '../src/services/stationService';
import { connector, registerParams } from './data';
import { Contract } from '../src/services/contract';
import { Wallet } from '../src/services/wallet';

function generateRandom() {
    return (Math.random() * 0xFFFFFFFFF << 0).toString(16);
}

describe('StationService', function () {

    const config = {
        version: '0.1.0',
        provider: 'http://localhost:8545',
        contracts: require('../config.json'),
        gasPrice: 18000000000
    };

    let stationService, contract, wallet;

    beforeEach(() => {
        const seed = 'filter march urge naive sauce distance under copy payment slow just cool';
        wallet = new Wallet(seed);
        contract = new Contract(config, 'StationStorage', wallet);
        stationService = new StationService(contract, wallet);
    });

    afterEach(async () => {
    });

    context('#getAllStations()', () => {

        it('return all stations', async function() {

            this.timeout(10000);
            const id1 = await stationService.createStation({ latitude: 21.345, longitude: -0.92332, openingHours: "123455677" });
            const id2 = await stationService.createStation({ latitude: 12.345, longitude: 10.01231, openingHours: "123455677" });
            const id3 = await stationService.createStation({ latitude: -3.000, longitude: 20.91232, openingHours: "123455677" });

            const stations = await stationService.getAllStations();
            expect(stationSet.size).to.equal(3);
        });

    });

    context('#createStation()', () => {
        it('should create station', async () => {
            const owner = wallet.address;
            const id = await stationService.createStation({ latitude: 51.345, longitude: -0.92332, openingHours: "123455677" });
            const station = await stationService.getStation(id);
            expect(station.id).to.not.equal(undefined);
            expect(station.owner.toLowerCase()).to.equal(owner.toLowerCase());
            expect(station.latitude).to.equal(51.345);
            expect(station.longitude).to.equal(-0.92332);
            expect(station.openingHours).to.equal("123455677");
        });
    });
});

