import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { Connector } from '../../src/models/connector';
import { EventPollerService } from '../../src/services/eventPollerService';
import { ConnectorService } from '../../src/services/connectorService';
import { ConnectorBuilder } from "../connectorBuilder";

describe('ConnectorService', function () {

    const provider = "http://localhost:8545";
    const config = require(process.env["HOME"] + '/.sharecharge/contract-defs.development.json');
    const connectorStorage = config['ConnectorStorage'];
    const gasPrice = 18000000000;
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let connectorService: ConnectorService, connectorStorageContract: Contract, wallet: Wallet, web3;

    before(async () => {
        web3 = new Web3(provider);
        wallet = new Wallet(seed);

        TestHelper.ensureFunds(web3, wallet);
    });

    beforeEach(async () => {
        const address = await TestHelper.deployContract(web3, connectorStorage);
        connectorStorageContract = new Contract(web3, {
            abi: connectorStorage.abi,
            address: address,
            gasPrice
        });

        connectorService = new ConnectorService(connectorStorageContract);
    });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
    });

    context('#create()', () => {
        it('should create an connector with the given parameters', async () => {

            const connector = new ConnectorBuilder()
                .withOwner("0x123456")
                .withIsAvailable(true)
                .build();

            // add it to connectors
            await connectorService.useWallet(wallet).create(connector);

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

            const connector = new ConnectorBuilder()
                .build();

            await connectorService.useWallet(wallet).create(connector);

            const result: Connector = await connectorService.getById(connector.id);
            expect(result.id).to.equal(connector.id);
        });
    });
});

