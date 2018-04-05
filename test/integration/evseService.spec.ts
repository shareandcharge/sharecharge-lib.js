import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { Evse } from '../../src/models/evse';
import { EvseService } from '../../src/services/evseService';
import { EvseBuilder } from "../evseBuilder";
import { ConfigProvider } from "../../src/services/configProvider";
import { ToolKit } from './../../src/utils/toolKit';
import { Station } from './../../src/models/station';
import { StationBuilder } from '../stationBuilder';
import { Key } from '../../src/models/key';
import { ContractProvider } from '../../src/services/contractProvider';

const config = new ConfigProvider();

describe('EvseService', function () {

    this.timeout(10 * 1000);
    const batchTimeout = 500;

    const defs = ToolKit.contractDefsForStage(config.stage);
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let evseService: EvseService, wallet: Wallet, key: Key, web3;

    before(async () => {
        web3 = new Web3(config.provider);
        wallet = new Wallet(seed);
        key = wallet.keychain[0];

        await TestHelper.ensureFunds(web3, key);
    });

    beforeEach(async () => {
        const contract = await TestHelper.createContract(web3, config, defs["EvseStorage"]);

        evseService = new EvseService(<ContractProvider>{
            obtain(key: string): Contract {
                return contract;
            }
        });
    });

    afterEach(async () => {
    });

    context('create', () => {
        it('should create a single evse with the given parameters', async () => {

            const evse = new EvseBuilder()
                .withIsAvailable(true)
                .build();

            // add it to evses
            await evseService.useWallet(wallet).create(evse);

            // get
            const result: Evse = await evseService.getById(evse.id);

            // compare
            expect(result.id).to.equal(evse.id);
            expect(result.owner.toLowerCase()).to.equal(key.address);
            expect(result.available).to.equal(evse.available);
        });

        it('should create evses in bulk', async () => {

            const evses: Evse[] = [];

            const station = new StationBuilder().build();

            for (let i = 1; i <= 10; i++) {
                evses.push(new EvseBuilder().withStation(station).build());
            }

            await evseService.useWallet(wallet).batch().create(...evses);

            return new Promise((resolve, reject) => {

                setTimeout(async () => {
                    const evse = await evseService.getByStation(station);
                    expect(evse.length).to.equal(10);
                    resolve();
                }, batchTimeout);

            });

        });
    });

    context('update', () => {
        it('should update a evse with the given parameters', async () => {
            const evse = new EvseBuilder()
                .withIsAvailable(true)
                .build();

            await evseService.useWallet(wallet).create(evse);

            const result = await evseService.getById(evse.id);

            evse.available = true;

            await evseService.useWallet(wallet).update(evse);

            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const result2 = await evseService.getById(evse.id);
                    expect(result2.available).to.equal(true);
                    resolve();
                }, batchTimeout);
            });

        });

        it('should update evses in bulk', async () => {

            const evses: Evse[] = [];

            const station = new StationBuilder().build();

            for (let i = 1; i <= 3; i++) {
                evses.push(new EvseBuilder().withIsAvailable(true).build());
            }

            await evseService.useWallet(wallet).batch().create(...evses);

            evses.forEach(evse => evse.available = false);

            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    await evseService.useWallet(wallet).batch().update(...evses);

                    setTimeout(async () => {
                        const contractevses = await evseService.getByStation(station);
                        expect(contractevses.filter(evse => evse.available === true).length).to.equal(0);
                        resolve();
                    }, batchTimeout);
                }, batchTimeout);
            });
        });
    });

    context('#getById()', () => {
        it('should get evse by Id', async () => {
            const evse = new EvseBuilder().build();

            await evseService.useWallet(wallet).create(evse);

            const result = await evseService.getById(evse.id);
            expect(result.id).to.equal(evse.id);
        });
    });

    context('#getByUid', ()=> {
        it('should get evse by uid', async () => {
            const evse = new EvseBuilder().build();
            await evseService.useWallet(wallet).create(evse);

            const result = await evseService.getByUid(evse.uid);
            expect(result.uid).to.equal(evse.uid);

        });
    });

    context('#areevsesAvailable', () => {
        it('should report false if all evses on a station are in use', async () => {
            const station = new Station();
            const builder = new EvseBuilder().withStation(station).withIsAvailable(false);
            await evseService.useWallet(wallet).create(builder.build());
            await evseService.useWallet(wallet).create(builder.build());
            await evseService.useWallet(wallet).create(builder.build());

            const result = await evseService.anyFree(station);
            expect(result).to.equal(false);
        });

        it('should report true if any evses on a station are free', async () => {
            const station = new Station();

            let builder = new EvseBuilder().withStation(station).withIsAvailable(false);
            await evseService.useWallet(wallet).create(builder.build());
            await evseService.useWallet(wallet).create(builder.build());

            builder = builder.withIsAvailable(true);
            await evseService.useWallet(wallet).create(builder.build());

            const result = await evseService.anyFree(station);
            expect(result).to.equal(true);
        });
    });
});
