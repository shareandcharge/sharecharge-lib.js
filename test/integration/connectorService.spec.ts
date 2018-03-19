import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { StationBuilder } from '../stationBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { Connector } from '../../src/models/connector';
import { EventPollerService } from '../../src/services/eventPollerService';
import { ConnectorService } from '../../src/services/connectorService';

describe('ConnectorService', function () {

    const provider = "http://localhost:8545";
    const config = require(process.env["HOME"] + '/.sharecharge/config.json');
    const connectorStorage = config['ConnectorStorage'];
    const gasPrice = 18000000000;
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let connectorService, contract, wallet, web3;

    before(async () => {
        web3 = new Web3(provider);
        wallet = new Wallet(seed);

        TestHelper.ensureFunds(web3, wallet);
    });

    beforeEach(async () => {
        const address = await TestHelper.deployContract(web3, connectorStorage);
        contract = new Contract(web3, {
            abi: connectorStorage.abi,
            address: address,
            gasPrice
        });

        connectorService = new ConnectorService(contract);
    });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
    });

    context('#create()', () => {
        it('should create an connector with the given parameters', async () => {

            // forge connector
            const connector = new Connector();
            connector.owner = "0x123456";
            connector.available = true;

            // add it to connectors
            await connectorService.create(connector, wallet);

            // get
            const result: Connector = await connectorService.getById(connector.id);

            // compare
            expect(result.id).to.equal(connector.id);
            expect(result.owner).to.equal(connector.owner);
            expect(result.available).to.equal(connector.available);
        });
    });

    context('#getById()', () => {
        it('should get Connector by Id', async () => {

            const connector = new Connector();
            await connectorService.create(connector, wallet);

            const result: Connector = await connectorService.getById(connector.id);
            expect(result.id).to.equal(connector.id);
        });
    });
});

