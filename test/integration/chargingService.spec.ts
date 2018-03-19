import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { StationBuilder } from '../../src/utils/stationBuilder';
import { ConnectorBuilder } from '../../src/utils/connectorBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPollerService } from '../../src/services/eventPollerService';
import { ChargingService } from '../../src/services/chargingService';
import { ConnectorService } from '../../src/services/connectorService';
import { StationService } from '../../src/services/stationService';
import { ChargingEvents } from '../../src/models/chargingEvents';
import { ChargingEventHandler } from '../../src/services/chargingEventHandler';

describe('ChargingService', function () {

    const provider = "http://localhost:8545";
    const config = require(process.env["HOME"] + '/.sharecharge/config.json');
    const stationStorage = config['StationStorage'];
    const connectorStorage = config['ConnectorStorage'];
    const charging = config['Charging'];
    const gasPrice = 18000000000;
    const seed1 = 'filter march urge naive sauce distance under copy payment slow just cool';
    const seed2 = 'filter march urge naive sauce distance under copy payment slow just warm';

    let chargingEventHandler, stationService, cpoChargingService, chargingService, stationStorageContract, connectorService, connectorStorageContract, chargingContract, cpoWallet, mspWallet, web3;

    before(async () => {

        web3 = new Web3(provider);
        cpoWallet = new Wallet(seed1);
        mspWallet = new Wallet(seed2);

        TestHelper.ensureFunds(web3, cpoWallet);
        TestHelper.ensureFunds(web3, mspWallet);
    });

    beforeEach(async () => {
        const stationStorageaddress = await TestHelper.deployContract(web3, stationStorage);
        stationStorageContract = new Contract(web3, {
            abi: stationStorage.abi,
            address: stationStorageaddress,
            gasPrice
        });

        const connectorStorageaddress = await TestHelper.deployContract(web3, connectorStorage);
        connectorStorageContract = new Contract(web3, {
            abi: connectorStorage.abi,
            address: connectorStorageaddress,
            gasPrice
        });

        const chargingAddress = await TestHelper.deployContract(web3, charging, [connectorStorageaddress]);
        chargingContract = new Contract(web3, {
            abi: charging.abi,
            address: chargingAddress,
            gasPrice
        });

        chargingEventHandler = new ChargingEventHandler(EventPollerService.instance, chargingContract);

        stationService = new StationService(stationStorageContract);
        connectorService = new ConnectorService(connectorStorageContract);
        chargingService = new ChargingService(chargingContract);
    });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
        chargingEventHandler.clear();
    });

    context('#start()', async () => {
        it('should request to start charging', async () => {

            let connectorId = "";
            let controllerAddress = "";

            const station = new StationBuilder().withOwner(cpoWallet.address).build();
            await stationService.useWallet(cpoWallet).create(station);

            const connector = new ConnectorBuilder().withStation(station).build();
            await connectorService.useWallet(cpoWallet).create(connector);

            chargingEventHandler.on(ChargingEvents.StartRequested, (id: string, controller: string) => {
                connectorId = id;
                controllerAddress = controller;
            });

            await chargingService.requestStart(mspWallet, connector, 240);

            await EventPollerService.instance.poll();

            expect(connectorId).to.equal(connector.id);
            expect(controllerAddress.toLowerCase()).to.equal(mspWallet.address);
        });
    });

});

