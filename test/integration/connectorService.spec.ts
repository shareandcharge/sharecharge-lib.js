import { OpeningHours } from './../../src/models/openingHours';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { Connector } from './../../src/models/connector';
import { ConnectorBuilder } from '../connectorBuilder';
import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { EventPoller } from '../../src/services/eventPoller';
import { ConnectorService } from '../../src/services/connectorService';
import { ConfigProvider } from "../../src/services/configProvider";
import { ToolKit } from './../../src/utils/toolKit';
import { IContractProvider } from './../../src/services/contractProvider';
import { Key } from '../../src/models/key';
import { Evse } from '../../src';

const config = new ConfigProvider();

describe('ConnectorService', function () {

    this.timeout(10 * 1000);
    const batchTimeout = 500;

    const defs = ToolKit.contractDefsForStage(config.stage);
    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';

    let connectorService: ConnectorService, wallet: Wallet, key: Key, web3;

    before(async () => {
        web3 = new Web3(config.provider);
        wallet = new Wallet(seed);
        key = wallet.keychain[0];

        await TestHelper.ensureFunds(web3, key);
    });

    // beforeEach(async () => {
    //     const testContractProvider = TestHelper.getTestContractProvider(web3, config, defs);
    //     connectorService = new ConnectorService(testContractProvider);
    // });

    beforeEach(async () => {
        const contract = await TestHelper.createContract(web3, config, defs["ConnectorStorage"]);

        connectorService = new ConnectorService(<IContractProvider>{
            obtain(key: string): Contract {
                return contract;
            }
        });
    });

    afterEach(async () => {
    });

    context('create', () => {
        it('should create Connector', async () => {
            const connector = new ConnectorBuilder()
                .withVoltage(120)
                .build();

            await connectorService.useWallet(wallet).create(connector);

            const result = await connectorService.getById(connector.id);

            expect(result.id).to.not.equal(undefined);
            expect(result.owner.toLowerCase()).to.equal(key.address);
            expect(result.voltage).to.equal(120);
        });

        it('should create Connectors in bulk', async () => {
            const evse = new Evse();

            const connectors: Connector[] = [];
            for (let i = 0; i < 2; i++) {
                connectors.push(new ConnectorBuilder().withEvseId(evse.id).build());
            }

            await connectorService.useWallet(wallet).batch().create(...connectors);

            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const allConnectors = await connectorService.getByEvse(evse.id);
                    expect(allConnectors.length).to.equal(2);
                    resolve();
                }, batchTimeout);
            });
        });
    });

    context('update', () => {
        it('should update a single Connector\'s parameters', async () => {
            const connector = new ConnectorBuilder().build();
            await connectorService.useWallet(wallet).create(connector);
            connector.amperage += 10;
            await connectorService.useWallet(wallet).update(connector);

            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const contractConnector = await connectorService.getById(connector.id);
                    expect(contractConnector.amperage).to.equal(40);
                    resolve();
                }, batchTimeout);
            });
        });

        it('should update multiple Connectors\' parameters', async () => {
            const connectors: Connector[] = [];
            for (let i = 0; i < 3; i++) {
                connectors.push(new ConnectorBuilder().build());
            }

            await connectorService.useWallet(wallet).batch().create(...connectors);

            connectors.forEach(connector => {
                connector.voltage += 10;
            });

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    expect(async () => await connectorService.useWallet(wallet).batch().update(...connectors)).to.not.throw();

                    // allow the above transaction(s) to be mined before the next test case
                    // otherwise the next nonce will be incorrect
                    setTimeout(() => resolve(), batchTimeout);

                }, batchTimeout);
            });
        });
    });

});
