import { ShareCharge } from './../../src/shareCharge';
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

describe('ShareCharge', function () {

    const provider = "http://localhost:8545";
    const contractDefs = require(process.env["HOME"] + '/.sharecharge/contract-defs.development.json');
    const gasPrice = 18000000000;
    const seed1 = 'filter march urge naive sauce distance under copy payment slow just cool';
    const seed2 = 'filter march urge naive sauce distance under copy payment slow just warm';

    let  connectorService, stationService, chargingService, cpoWallet, mspWallet, web3;

    before(async () => {
        web3 = new Web3(provider);

        cpoWallet = new Wallet(seed1);
        mspWallet = new Wallet(seed2);

        TestHelper.ensureFunds(web3, cpoWallet);
        TestHelper.ensureFunds(web3, mspWallet);
    });

    beforeEach(async () => {
        const stationStorageDef = contractDefs['StationStorage'];
        const stationStorageAddress = await TestHelper.deployContract(web3, stationStorageDef);
        const stationStorageContract = new Contract(web3, {
            abi: stationStorageDef.abi,
            address: stationStorageAddress,
            gasPrice
        });

        const connectorStorageDef = contractDefs['ConnectorStorage'];
        const connectorStorageAddress = await TestHelper.deployContract(web3, connectorStorageDef);
        const connectorStorageContract = new Contract(web3, {
            abi: connectorStorageDef.abi,
            address: connectorStorageAddress,
            gasPrice
        });

        const chargingDef = contractDefs['Charging'];
        const chargingAddress = await TestHelper.deployContract(web3, chargingDef, [connectorStorageAddress]);
        const chargingContract = new Contract(web3, {
            abi: chargingDef.abi,
            address: chargingAddress,
            gasPrice
        });

        stationService = new StationService(stationStorageContract);
        connectorService = new ConnectorService(connectorStorageContract);
        chargingService = new ChargingService(chargingContract);
    });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
    });

    context('#start()', async () => {
        it('should request to start charging', async () => {

            const cpoSC = new ShareCharge();
            expect().to.equal();
        });
    });

});

