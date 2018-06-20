import { ToolKit } from '../../src/utils/toolKit';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { ShareCharge } from '../../src/shareCharge';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPoller } from '../../src/services/eventPoller';
import { ChargingService } from '../../src/services/chargingService';
import { ConfigProvider } from "../../src/services/configProvider";
import { Key } from '../../src/models/key';
import { ContractProvider } from '../../src/services/contractProvider';
import { TokenService } from '../../src/services/tokenService';
import { StorageService } from '../../src/services/storageService';
import { IpfsProvider } from '../../src/services/ipfsProvider';
import IpfsMock from '../ipfsMock';

const ocpiLocation = require('../data/ocpiLocation.json');

const config = new ConfigProvider();

describe('ShareCharge', function () {

    this.timeout(30 * 1000);

    const contractDefs = ToolKit.contractDefsForStage(config.stage);

    const seed1 = 'filter march urge naive sauce distance under copy payment slow just warm';
    const seed2 = 'filter march urge naive sauce distance under copy payment slow just cool';
    const seed3 = 'filter march urge naive sauce distance under copy payment slow just cold';

    let shareCharge: ShareCharge;
    let cpoWallet: Wallet, cpoKey: Key;
    let mspWallet: Wallet, mspKey: Key;
    let driverWallet: Wallet, driverKey: Key;
    let chargingService: ChargingService;
    let tokenService: TokenService;
    let storageService: StorageService;
    let tokenAddress: string;
    let eventPoller: EventPoller;
    let web3;

    const evseId = 'BE-BEC-E041503001';

    before(async () => {

        web3 = new Web3(config.ethProvider);

        cpoWallet = new Wallet(seed1);
        cpoKey = cpoWallet.keychain[0];

        mspWallet = new Wallet(seed2);
        mspKey = mspWallet.keychain[0];

        driverWallet = new Wallet(seed3);
        driverKey = driverWallet.keychain[0];

        await TestHelper.ensureFunds(web3, cpoKey);
        await TestHelper.ensureFunds(web3, mspKey);
        await TestHelper.ensureFunds(web3, driverKey);

        const coinbase = await web3.eth.getCoinbase();

        const storageContract = await TestHelper.createContract(web3, config, contractDefs["ExternalStorage"]);
        storageService = new StorageService(<ContractProvider>{
            obtain(key: string): Contract {
                return storageContract;
            }
        }, <IpfsProvider>IpfsMock);

        const chargingContract = await TestHelper.createContract(web3, config, contractDefs["Charging"]);
        chargingService = new ChargingService(<ContractProvider>{
            obtain(key: string): Contract {
                return chargingContract;
            }
        });

        const tokenContract = await TestHelper.createContract(web3, config, contractDefs["MSPToken"], ["S&C Token", "SCT"]);
        tokenService = new TokenService(new ContractProvider(new ConfigProvider({tokenAddress: tokenContract.address})));

        await chargingContract.native.methods["setStorageAddress"](storageContract.address).send({from: coinbase});
        // await evseContract.native.methods["setAccess"](chargingContract.address).send({ from: coinbase });

        eventPoller = new EventPoller(config);

        shareCharge = new ShareCharge(chargingService, tokenService, storageService, eventPoller);
        tokenAddress = await shareCharge.token.useWallet(mspWallet).deploy('MSP Token', 'MSP');
        await shareCharge.token.useWallet(mspWallet).setAccess(shareCharge.charging.address);
        await shareCharge.token.useWallet(mspWallet).mint(driverKey.address, 1000);
    });

    beforeEach(async () => {
    });

    afterEach(async () => {
        // eventPoller.reset();
    });

    context('#charging', async () => {

        it('should broadcast start confirmed to msp', async () => {
            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);

            let controller = "";

            await shareCharge.on("StartConfirmed", async (result) => {
                if (result.scId === location.scId
                    && result.controller.toLowerCase() === driverKey.address) {

                    controller = result.controller;
                }
            });

            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 0, 20, tokenAddress, 100);
            await shareCharge.charging.useWallet(cpoWallet).confirmStart(location.scId, evseId, '0x01');

            await eventPoller.poll();
            expect(controller.toLowerCase()).to.equal(driverKey.address);
        });

        it('should broadcast stop confirmed to msp', async () => {
            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);

            let controller = "";
            let finalPrice = 200;
            let timestamp: number;
            let token: string = "";

            await shareCharge.on("StopConfirmed", async (result) => {
                if (result.scId === location.scId
                    && result.controller.toLowerCase() === driverKey.address) {

                    controller = result.controller;
                }
            });

            await shareCharge.on("ChargeDetailRecord", async (result) => {
                finalPrice = result.finalPrice;
                timestamp = result.timestamp;
                token = result.tokenAddress;
            });

            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 3, 60, shareCharge.token.address, 300);
            await shareCharge.charging.useWallet(cpoWallet).confirmStart(location.scId, evseId, '0x01');
            await shareCharge.charging.useWallet(driverWallet).requestStop(location.scId, evseId);
            await shareCharge.charging.useWallet(cpoWallet).confirmStop(location.scId, evseId);

            await eventPoller.poll();

            await shareCharge.charging.useWallet(cpoWallet).chargeDetailRecord(location.scId, evseId, 30, (Date.now() - 30 * 60 * 1000) / 1000, finalPrice);
            await eventPoller.poll();

            expect(controller.toLowerCase()).to.equal(driverKey.address);
            expect(Number(finalPrice)).to.equal(200);
            expect(token).to.equal(shareCharge.token.address);
        });

        it('should broadcast error to msp', async () => {
            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);

            let controller = "";
            let errorCode = -1;

            await shareCharge.on("Error", async (result) => {
                if (result.scId === location.scId
                    && result.controller.toLowerCase() === driverKey.address) {
                    controller = result.controller;
                    errorCode = parseInt(result.errorCode);
                }
            });

            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 0, 20, shareCharge.token.address, 0);
            await shareCharge.charging.useWallet(cpoWallet).error(location.scId, evseId, 0);

            await eventPoller.poll();

            expect(controller.toLowerCase()).to.equal(driverKey.address);
            expect(errorCode).to.equal(0);
        });


        it('should broadcast charge stop requested to cpo', async () => {
            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);

            let eventEvseId = "";

            await shareCharge.on("StopRequested", async (result) => {
                if (result.scId == location.scId) {
                    eventEvseId = result.evseId;
                }
            });

            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 0, 11, shareCharge.token.address, 0);
            await shareCharge.charging.useWallet(cpoWallet).confirmStart(location.scId, evseId, '0x01');
            await shareCharge.charging.useWallet(driverWallet).requestStop(location.scId, evseId);

            await eventPoller.poll();

            expect(eventEvseId).to.equal(evseId);
        });

        it('should broadcast charge start requested to cpo', async () => {
            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);

            let eventEvseId = "";
            let controller = "";

            await shareCharge.on("StartRequested", async (result) => {
                if (result.scId == location.scId) {
                    eventEvseId = result.evseId;
                    controller = result.controller;
                }
            });

            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 1, 0, shareCharge.token.address, 0);

            await eventPoller.poll();

            expect(eventEvseId).to.equal(evseId);
            expect(controller.toLowerCase()).to.equal(driverKey.address);
        });

        it('should get session information during a charge', async () => {
            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);
            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 1, 0, shareCharge.token.address, 0);
            const session = await shareCharge.charging.getSession(location.scId, evseId);

            expect(session.controller.toLowerCase()).to.equal(driverKey.address);
            expect(session.token).to.equal(shareCharge.token.address);
            expect(session.price).to.equal('0');
        });

    });

    context('#store', () => {

        it('should broadcast location created and updated events', async () => {
            let locationAddedId = "";
            let locationUpdatedId = "";

            shareCharge.on("LocationAdded", (result) => {
                locationAddedId = result.scId;
            });

            shareCharge.on("LocationUpdated", (result) => {
                locationUpdatedId = result.evseId;
            });

            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);
            await shareCharge.store.useWallet(cpoWallet).updateLocation(location.scId, ocpiLocation);

            await eventPoller.poll();

            expect(locationAddedId).to.equal(location.scId);
        });

    });

    context('#token', () => {

        it('should set the token address for subsequent instances', async () => {
            const address = shareCharge.token.address;
            const address2 = await shareCharge.token.useWallet(mspWallet).deploy('MSPToken', 'MSP');
            expect(shareCharge.token.address).to.not.equal(address);
            shareCharge.token.address = address;
            expect(shareCharge.token.address).to.equal(address);
            const sc2 = ShareCharge.getInstance();
            expect(sc2.token.address).to.equal(address);
        });
    });

    context('#getLogs()', () => {

        it('should retrieve all contract events of a particular type', async () => {
            const logsBefore = await shareCharge.store.contract.getLogs('LocationUpdated');

            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);
            await shareCharge.store.useWallet(cpoWallet).updateLocation(location.scId, ocpiLocation);
            await shareCharge.store.useWallet(cpoWallet).updateLocation(location.scId, ocpiLocation);
            await shareCharge.store.useWallet(cpoWallet).updateLocation(location.scId, ocpiLocation);


            const logsAfter = await shareCharge.store.contract.getLogs('LocationUpdated');
            expect(logsAfter.length).to.equal(logsBefore.length + 3);
            expect(logsAfter[0].blockNumber).to.be.greaterThan(0);
        });

        it('should filter contract events by equal value', async () => {
            const location1 = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);
            const location2 = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);
            const location3 = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);

            const logsBefore = await shareCharge.charging.contract.getLogs('StartRequested');

            await shareCharge.charging.useWallet(driverWallet).requestStart(location1.scId, evseId, 1, 0, shareCharge.token.address, 0);
            await shareCharge.charging.useWallet(cpoWallet).requestStart(location2.scId, evseId, 1, 0, shareCharge.token.address, 0);
            await shareCharge.charging.useWallet(driverWallet).requestStart(location3.scId, evseId, 1, 0, shareCharge.token.address, 0);

            const logsAfter = await shareCharge.charging.contract.getLogs('StartRequested', {controller: driverKey.address});
            expect(logsAfter.length).to.equal(logsBefore.length + 2);
        });

        it('should filter charge detail record events by timestamp start and end', async () => {
            let timestamp: number;
            let finalPrice = 150;

            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);

            const logsBefore = await shareCharge.charging.contract.getLogs('ChargeDetailRecord');
            await shareCharge.on("ChargeDetailRecord", async (result) => {
                timestamp = result.timestamp;
                finalPrice = result.finalPrice;
            });

            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 1, 0, shareCharge.token.address, 200);
            await shareCharge.charging.useWallet(cpoWallet).confirmStart(location.scId, evseId, '0x01');
            await shareCharge.charging.useWallet(cpoWallet).confirmStop(location.scId, evseId);
            await shareCharge.charging.useWallet(cpoWallet).chargeDetailRecord(location.scId, evseId, 0, (Date.now() - 50000) / 1000, finalPrice);

            const logsAfter = await shareCharge.charging.contract.getLogs('ChargeDetailRecord', {
                controller: driverKey.address,
                endTime: {start: 152469000, end: 3524843383145}
            });
            expect(logsAfter.length).to.equal(logsBefore.length + 1);
        });

        it('should return gasUsed and timestamp', async () => {
            const location = await shareCharge.store.useWallet(cpoWallet).addLocation(ocpiLocation);
            await shareCharge.charging.useWallet(driverWallet).requestStart(location.scId, evseId, 1, 0, shareCharge.token.address, 0);

            const logsAfter = await shareCharge.charging.contract.getLogs('StartRequested', {controller: driverKey.address});
            expect(logsAfter[0].gasUsed).to.not.be.undefined;
            expect(logsAfter[0].timestamp).to.not.be.undefined;
        });
    });


});
