import { OpeningHours } from './../../src/models/openingHours';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { Station } from './../../src/models/station';
import { StationBuilder } from '../stationBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPoller } from '../../src/services/eventPoller';
import { StationService } from '../../src/services/stationService';
import { config } from "../../src/utils/config";
import { ToolKit } from './../../src/utils/toolKit';
import { IContractProvider } from './../../src/services/contractProvider';
import { Key } from '../../src/models/key';

describe('StationService', function () {

    this.timeout(10 * 1000);
    const batchTimeout = 500;

    const defs = ToolKit.contractDefsForStage(config.stage);
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let stationService: StationService, wallet: Wallet, key: Key, web3;

    before(async () => {
        web3 = new Web3(config.provider);
        wallet = new Wallet(seed);
        key = wallet.keyAtIndex(0);

        await TestHelper.ensureFunds(web3, key);
    });

    beforeEach(async () => {
        const testContractProvider = TestHelper.getTestContractProvider(web3, config, defs);
        stationService = new StationService(testContractProvider);
    });

    afterEach(async () => {
        EventPoller.instance.removeAll();
    });

    context('create', () => {
        it('should create station', async () => {
            const station = new StationBuilder()
                .withOwner(key.address)
                .withLatitude(51.345)
                .withLongitude(-0.92332)
                .build();

            await stationService.useWallet(wallet).create(station);

            const result = await stationService.getById(station.id);

            expect(result.id).to.not.equal(undefined);
            expect(result.owner.toLowerCase()).to.equal(station.owner.toLowerCase());
            expect(result.latitude).to.equal(station.latitude);
            expect(result.longitude).to.equal(station.longitude);
            expect(OpeningHours.encode(result.openingHours)).to.equal(OpeningHours.encode(station.openingHours));
        });

        it('should create stations in bulk', async () => {
            const stations: Station[] = [];
            for (let i = 0; i < 5; i++) {
                stations.push(new StationBuilder().build());
            }

            await stationService.useWallet(wallet).batch().create(...stations);

            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const allStations = await stationService.getAll();
                    expect(allStations.length).to.equal(5);
                    resolve();
                }, batchTimeout);
            });

        });
    });

    context('update', () => {
        it('should update a single station\'s parameters', async () => {
            const station = new StationBuilder().build();
            await stationService.useWallet(wallet).create(station);
            station.latitude = 52;
            station.longitude = 10.8;
            await stationService.useWallet(wallet).update(station);

            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const contractStation = await stationService.getById(station.id);
                    expect(contractStation.latitude).to.equal(0.000052);
                    expect(contractStation.longitude).to.equal(0.00001);
                    resolve();
                }, batchTimeout);
            });
        });

        it('should update multiple stations\' parameters', async () => {
            const stations: Station[] = [];
            for (let i = 0; i < 3; i++) {
                stations.push(new StationBuilder().build());
            }

            await stationService.useWallet(wallet).batch().create(...stations);

            stations.forEach(station => {
                station.latitude = 50 * 1000000;
                station.longitude = 20 * 1000000;
            });

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    expect(async () => await stationService.useWallet(wallet).batch().update(...stations)).to.not.throw();

                    // allow the above transaction(s) to be mined before the next test case
                    // otherwise the next nonce will be incorrect
                    setTimeout(() => resolve(), batchTimeout);

                }, batchTimeout);
            });
        });
    });

    context('#getAllStations()', () => {
        it('return all stations', async function () {
            const station = new StationBuilder().withOwner(key.address).build();

            await stationService.useWallet(wallet).create(station);
            await stationService.useWallet(wallet).create(station);
            await stationService.useWallet(wallet).create(station);

            const result = await stationService.getAll();
            expect(result.length).to.equal(3);
        });
    });

    context('#isPersisted()', () => {
        it('should return true for persisted stations', async function () {
            const station = new StationBuilder().withOwner(key.address).build();
            await stationService.useWallet(wallet).create(station);
            const result = await stationService.isPersisted(station);
            expect(result).to.equal(true);
        });

        it('should return false for unpersisted stations', async function () {
            const station = new StationBuilder().withOwner(key.address).build();
            const result = await stationService.isPersisted(station);
            expect(result).to.equal(false);
        });
    });

});
