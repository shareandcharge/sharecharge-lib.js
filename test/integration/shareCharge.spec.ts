import { ToolKit } from './../../src/utils/toolKit';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { Evse } from './../../src/models/evse';
import { ShareCharge } from './../../src/shareCharge';
import { StationBuilder } from '../stationBuilder';
import { EvseBuilder } from '../evseBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPoller } from '../../src/services/eventPoller';
import { ChargingService } from '../../src/services/chargingService';
import { EvseService } from '../../src/services/evseService';
import { StationService } from '../../src/services/stationService';
import { Station } from '../../src/models/station';
import { ConfigProvider } from "../../src/services/configProvider";
import { Key } from '../../src/models/key';
import { ContractProvider } from '../../src/services/contractProvider';
import { TokenService } from '../../src/services/tokenService';

const config = new ConfigProvider();

describe('ShareCharge', function () {

    this.timeout(20 * 1000);
    const batchTimeout = 500;

    const contractDefs = ToolKit.contractDefsForStage(config.stage);

    const seed1 = 'filter march urge naive sauce distance under copy payment slow just cool';
    const seed2 = 'filter march urge naive sauce distance under copy payment slow just warm';

    let shareCharge: ShareCharge, cpoWallet: Wallet, cpoKey: Key, mspWallet: Wallet, mspKey: Key, web3;
    let stationService: StationService;
    let evseService: EvseService;
    let chargingService: ChargingService;
    let tokenService: TokenService;
    let eventPoller: EventPoller;

    before(async () => {

        web3 = new Web3(config.provider);

        cpoWallet = new Wallet(seed1);
        cpoKey = cpoWallet.keychain[0];

        mspWallet = new Wallet(seed2);
        mspKey = mspWallet.keychain[0];

        await TestHelper.ensureFunds(web3, cpoKey);
        await TestHelper.ensureFunds(web3, mspKey);

        const coinbase = await web3.eth.getCoinbase();

        const evseContract = await TestHelper.createContract(web3, config, contractDefs["EvseStorage"]);
        evseService = new EvseService(<ContractProvider>{
            obtain(key: string): Contract {
                return evseContract;
            }
        });

        const stationContract = await TestHelper.createContract(web3, config, contractDefs["StationStorage"]);
        stationService = new StationService(<ContractProvider>{
            obtain(key: string): Contract {
                return stationContract;
            }
        });

        const chargingContract = await TestHelper.createContract(web3, config, contractDefs["Charging"]);
        chargingService = new ChargingService(<ContractProvider>{
            obtain(key: string): Contract {
                return chargingContract;
            }
        });

        const tokenContract = await TestHelper.createContract(web3, config, contractDefs["MSPToken"], ["MSPToken", "MSP"]);
        tokenService = new TokenService(<ContractProvider>{
            obtain(key: string): Contract {
                return tokenContract;
            }
        });

        await chargingContract.native.methods["setEvsesAddress"](evseContract.address).send({ from: coinbase });
        await chargingContract.native.methods["setTokenAddress"](tokenContract.address).send({ from: coinbase });

        await evseContract.native.methods["setAccess"](chargingContract.address).send({ from: coinbase });
        await tokenContract.native.methods["setAccess"](chargingContract.address).send({ from: coinbase });

        // mint 100 euros worth of stable tokens for the msp user
        await tokenContract.native.methods["mint"](mspKey.address, 10000).send({ from: coinbase });

        eventPoller = new EventPoller(config);
    });

    beforeEach(async () => {
        shareCharge = new ShareCharge(stationService, evseService, chargingService, tokenService, eventPoller);
    });

    afterEach(async () => {
        // eventPoller.reset();
    });

    context('#stations', async () => {

        it('should broadcast start confirmed to msp', async () => {
            const evse = new EvseBuilder()
                .withIsAvailable(true)
                .withBasePrice(1)
                .build();

            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            let evseId = "";
            let controller = "";

            await shareCharge.on("StartConfirmed", async (result) => {
                if (result.evseId === evse.id
                    && result.controller.toLowerCase() === mspKey.address) {

                    evseId = result.evseId;
                    controller = result.controller;
                }
            });

            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);
            await shareCharge.charging.useWallet(cpoWallet).confirmStart(evse);

            await eventPoller.poll();

            expect(evseId).to.equal(evse.id);
            expect(controller.toLowerCase()).to.equal(mspKey.address);

        });

        it('should broadcast stop confirmed to msp', async () => {
            const evse = new EvseBuilder().withBasePrice(1).build();
            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            let evseId = "";
            let controller = "";

            await shareCharge.on("StopConfirmed", async (result) => {
                if (result.evseId === evse.id
                    && result.controller.toLowerCase() === mspKey.address) {

                    evseId = result.evseId;
                    controller = result.controller;
                }
            });
            
            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 100);
            
            await shareCharge.charging.useWallet(cpoWallet).confirmStart(evse);
            await shareCharge.charging.useWallet(mspWallet).requestStop(evse);
            console.log("first !");
            await shareCharge.charging.useWallet(cpoWallet).confirmStop(evse, Date.now(), Date.now() + 3600, 18000);
            console.log("second !");

            await eventPoller.poll();

            expect(evseId).to.equal(evse.id);
            expect(controller.toLowerCase()).to.equal(mspKey.address);

        });

        it('should broadcast error to msp', async () => {
            const evse = new EvseBuilder().withBasePrice(1).build();
            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            let evseId = "";
            let controller = "";
            let errorCode = -1;

            await shareCharge.on("Error", async (result) => {
                if (result.evseId === evse.id
                    && result.controller.toLowerCase() === mspKey.address) {
                    evseId = result.evseId;
                    controller = result.controller;
                    errorCode = parseInt(result.errorCode);
                }
            });

            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);
            await shareCharge.charging.useWallet(cpoWallet).error(evse, 0);

            await eventPoller.poll();

            expect(evseId).to.equal(evse.id);
            expect(controller.toLowerCase()).to.equal(mspKey.address);
            expect(errorCode).to.equal(0);

        });


        it('should broadcast charge stop requested to cpo', async () => {
            const evse = new EvseBuilder().withBasePrice(1).build();
            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            let evseId = "";

            await shareCharge.on("StopRequested", async (result) => {
                if (result.evseId == evse.id) {
                    evseId = result.evseId;
                }
            });

            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);
            await shareCharge.charging.useWallet(cpoWallet).confirmStart(evse);
            await shareCharge.charging.useWallet(mspWallet).requestStop(evse);

            await eventPoller.poll();

            expect(evseId).to.equal(evse.id);
        });

        it('should broadcast charge start requested to cpo', async () => {
            const evse = new EvseBuilder().withBasePrice(1).build();
            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            let evseId = "";
            let controller = "";

            await shareCharge.on("StartRequested", async (result) => {
                if (result.evseId == evse.id) {
                    evseId = result.evseId;
                    controller = result.controller;
                }
            });

            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);

            await eventPoller.poll();

            expect(evseId).to.equal(evse.id);
            expect(controller.toLowerCase()).to.equal(mspKey.address);
        });

        it('should broadcast evse created and updated events', async () => {
            let evseCreatedId = "";
            let evseUpdatedId = "";

            shareCharge.on("EvseCreated", (result) => {
                evseCreatedId = result.evseId;
            });

            shareCharge.on("EvseUpdated", (result) => {
                evseUpdatedId = result.evseId;
            });

            const evse = new EvseBuilder().withBasePrice(1).build();

            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            evse.available = !evse.available;
            await shareCharge.evses.useWallet(cpoWallet).update(evse);

            await eventPoller.poll();

            expect(evseCreatedId).to.equal(evse.id);

            // expect(evseUpdatedId).to.equal(evse.id);

            // The next test needs to wait for the update transaction to actually be mined
            // otherwise the nonce for creating a station will be incorrect
            return new Promise((resolve, reject) => setTimeout(() => resolve(), batchTimeout));
        });

        it('should broadcast station created and updated events', async () => {
            let stationCreatedId = "";
            let stationUpdatedId = "";

            shareCharge.on("StationCreated", (result) => {
                stationCreatedId = result.stationId;
            });

            shareCharge.on("StationUpdated", (result) => {
                stationUpdatedId = result.stationId;
            });

            const station = new StationBuilder().build();
            await shareCharge.stations.useWallet(cpoWallet).create(station);

            station.latitude = station.latitude - 1;
            station.longitude = station.longitude + 1;

            await shareCharge.stations.useWallet(cpoWallet).update(station);

            await eventPoller.poll();

            expect(stationCreatedId).to.equal(station.id);
            // expect(stationUpdatedId).to.equal(station.id);
        });
    });

    context('#GetLogs()', () => {

        it('should retrieve all contract events of a particular type', async () => {
            const evse = new EvseBuilder().withBasePrice(1).build();
            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            const logsBefore = await shareCharge.charging.contract.getLogs('StartRequested');

            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);
            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);
            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);

            const logsAfter = await shareCharge.charging.contract.getLogs('StartRequested');
            expect(logsAfter.length).to.equal(logsBefore.length + 3);
            expect(logsAfter[0].blockNumber).to.be.greaterThan(0);
        });

        it('should filter contract events', async () => {
            const evse = new EvseBuilder().withBasePrice(1).build();
            await shareCharge.evses.useWallet(cpoWallet).create(evse);

            const logsBefore = await shareCharge.charging.contract.getLogs('StartRequested');

            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);
            await shareCharge.charging.useWallet(cpoWallet).requestStart(evse, 0);
            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);

            const logsAfter = await shareCharge.charging.contract.getLogs('StartRequested', { controller: mspWallet.keychain[0].address });
            expect(logsAfter.length).to.equal(logsBefore.length + 2);
        });

        it('should return gasUsed and timestamp', async () => {
            const evse = new EvseBuilder().withBasePrice(1).build();
            await shareCharge.evses.useWallet(cpoWallet).create(evse);
            await shareCharge.charging.useWallet(mspWallet).requestStart(evse, 0);

            const logsAfter = await shareCharge.charging.contract.getLogs('StartRequested', { controller: mspWallet.keychain[0].address });
            expect(logsAfter[0].gasUsed).to.not.be.undefined;
            expect(logsAfter[0].timestamp).to.not.be.undefined;
        });
    });


});
