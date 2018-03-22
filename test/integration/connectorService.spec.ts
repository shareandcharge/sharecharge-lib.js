import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { Connector } from '../../src/models/connector';
import { EventPoller } from '../../src/services/eventPoller';
import { ConnectorService } from '../../src/services/connectorService';
import { ConnectorBuilder } from "../connectorBuilder";
import { config } from "../../src/utils/config";
import { ToolKit } from './../../src/utils/toolKit';
import { Station } from './../../src/models/station';

describe('ConnectorService', function () {

    this.timeout(10 * 1000);

    const defs = ToolKit.contractDefsForStage(config.stage);
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let connectorService: ConnectorService, wallet: Wallet, web3;

    before(async () => {
        web3 = new Web3(config.provider);
        wallet = new Wallet(seed);

        await TestHelper.ensureFunds(web3, wallet);
    });

    beforeEach(async () => {
        const testContractProvider = TestHelper.getTestContractProvider(web3, config, defs);
        connectorService = new ConnectorService(testContractProvider);
    });

    afterEach(async () => {
        EventPoller.instance.removeAll();
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
            expect(result.owner.toLowerCase()).to.equal(wallet.address);
            expect(result.available).to.equal(connector.available);
        });
    });

    context('#getById()', () => {
        it('should get Connector by Id', async () => {
            const connector = new ConnectorBuilder().build();

            await connectorService.useWallet(wallet).create(connector);

            const result = await connectorService.getById(connector.id);
            expect(result.id).to.equal(connector.id);
        });
    });

    context('#areConnectorsAvailable', () => {
        it('should report false if all connectors on a station are in use', async () => {
            const station = new Station();
            const builder = new ConnectorBuilder().withStation(station).withIsAvailable(false);
            await connectorService.useWallet(wallet).create(builder.build());
            await connectorService.useWallet(wallet).create(builder.build());
            await connectorService.useWallet(wallet).create(builder.build());

            const result = await connectorService.anyFree(station);
            expect(result).to.equal(false);
        });

        it('should report true if any connectors on a station are free', async () => {
            const station = new Station();

            let builder = new ConnectorBuilder().withStation(station).withIsAvailable(false);
            await connectorService.useWallet(wallet).create(builder.build());
            await connectorService.useWallet(wallet).create(builder.build());

            builder = builder.withIsAvailable(true);
            await connectorService.useWallet(wallet).create(builder.build());

            const result = await connectorService.anyFree(station);
            expect(result).to.equal(true);
        });
    });
});

