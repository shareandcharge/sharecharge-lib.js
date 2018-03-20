import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { StationBuilder } from '../stationBuilder';
import { ConnectorBuilder } from '../connectorBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPollerService } from '../../src/services/eventPollerService';
import { ChargingService } from '../../src/services/chargingService';
import { ConnectorService } from '../../src/services/connectorService';
import { StationService } from '../../src/services/stationService';
import { ChargingEvents } from '../../src/models/chargingEvents';
import { ChargingEventHandler } from '../../src/services/chargingEventHandler';
import { loadContractDefs } from "../../src/utils/defsLoader";
import { config } from "../../src/utils/config";

describe('ChargingService', function () {

    this.timeout(10 * 1000);

    const contractDefs = loadContractDefs(config.stage);
    const seed1 = 'filter march urge naive sauce distance under copy payment slow just cool';
    const seed2 = 'filter march urge naive sauce distance under copy payment slow just warm';

    let chargingEventHandler: ChargingEventHandler, stationService: StationService, chargingService: ChargingService,
        stationStorageContract: Contract, connectorService: ConnectorService, connectorStorageContract: Contract,
        chargingContract: Contract, cpoWallet: Wallet, mspWallet: Wallet,
        web3;

    before(async () => {
        web3 = new Web3(config.provider);
        cpoWallet = new Wallet(seed1);
        mspWallet = new Wallet(seed2);

        TestHelper.ensureFunds(web3, cpoWallet);
        TestHelper.ensureFunds(web3, mspWallet);
    });

    beforeEach(async () => {

        const stationStorageDef = contractDefs['StationStorage'];
        const stationStorageaddress = await TestHelper.deployContract(web3, stationStorageDef);
        stationStorageContract = new Contract(web3, {
            abi: stationStorageDef.abi,
            address: stationStorageaddress,
            gasPrice: config.gasPrice
        });

        const connectorStorageDef = contractDefs['ConnectorStorage'];
        const connectorStorageaddress = await TestHelper.deployContract(web3, connectorStorageDef);
        connectorStorageContract = new Contract(web3, {
            abi: connectorStorageDef.abi,
            address: connectorStorageaddress,
            gasPrice: config.gasPrice
        });

        const chargingDef = contractDefs['Charging'];
        const chargingAddress = await TestHelper.deployContract(web3, chargingDef, [connectorStorageaddress]);
        chargingContract = new Contract(web3, {
            abi: chargingDef.abi,
            address: chargingAddress,
            gasPrice: config.gasPrice
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

            await chargingService.useWallet(mspWallet).requestStart(connector, 240);

            await EventPollerService.instance.poll();

            expect(connectorId).to.equal(connector.id);
            expect(controllerAddress.toLowerCase()).to.equal(mspWallet.address);
        });
    });

});

