import { Connector } from './../../src/models/connector';
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
import { Station } from '../../src/models/station';

describe('ShareCharge', function () {

    const config = {
        provider: "http://localhost:8545",
        gasPrice: 18000000000
    };
    const contractDefs = require(process.env["HOME"] + '/.sharecharge/contract-defs.development.json');
    const seed1 = 'filter march urge naive sauce distance under copy payment slow just cool';
    const seed2 = 'filter march urge naive sauce distance under copy payment slow just warm';

    let connectorService, stationService, chargingService, cpoWallet, mspWallet, web3;

    before(async () => {
        web3 = new Web3(config.provider);

        cpoWallet = new Wallet(seed1);
        mspWallet = new Wallet(seed2);

        TestHelper.ensureFunds(web3, cpoWallet);
        TestHelper.ensureFunds(web3, mspWallet);
    });

    beforeEach(async () => { });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
    });

    context('#stations', async () => {
        it('should broadcast connector created and updated events', async () => {
            let shareCharge = new ShareCharge(config, contractDefs);

            let connectorCreatedId = "";
            let connectorUpdatedId = "";

            shareCharge.on("ConnectorCreated", (result) => {
                connectorCreatedId = result.connectorId;
            });

            shareCharge.on("ConnectorUpdated", (result) => {
                connectorUpdatedId = result.connectorId;
            });

            let connector = new ConnectorBuilder().build();

            await shareCharge.connectors.useWallet(cpoWallet).create(connector);

            connector.available = !connector.available;
            await shareCharge.connectors.useWallet(cpoWallet).update(connector);

            await EventPollerService.instance.poll();

            expect(connectorCreatedId).to.equal(connector.id);
            expect(connectorUpdatedId).to.equal(connector.id);

        });

        it('should broadcast station created and updated events', async () => {
            let shareCharge = new ShareCharge(config, contractDefs);

            let stationCreatedId = "";
            let stationUpdatedId = "";

            shareCharge.on("StationCreated", (result) => {
                stationCreatedId = result.stationId;
            });

            shareCharge.on("StationUpdated", (result) => {
                stationUpdatedId = result.stationId;
            });

            let station = new StationBuilder().build();
            await shareCharge.stations.useWallet(cpoWallet).create(station);

            station.latitude = station.latitude - 1;
            await shareCharge.stations.useWallet(cpoWallet).update(station);

            await EventPollerService.instance.poll();

            expect(stationCreatedId).to.equal(station.id);
            expect(stationUpdatedId).to.equal(station.id);

        });
    });

});

