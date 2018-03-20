import { Connector } from './../../src/models/connector';
import { ShareCharge } from './../../src/shareCharge';
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
import { Station } from '../../src/models/station';
import { loadContractDefs } from "../../src/utils/defsLoader";

describe('ShareCharge', function () {

    const config = {
        provider: "http://localhost:8545",
        gasPrice: 18000000000
    };

    const contractDefs = loadContractDefs("development");

    const seed1 = 'filter march urge naive sauce distance under copy payment slow just cool';
    const seed2 = 'filter march urge naive sauce distance under copy payment slow just warm';

    let connectorService, stationService, chargingService, cpoWallet, mspWallet, web3;

    function resolve() {
        return new ShareCharge(config, contractDefs);
    }

    before(async () => {
        web3 = new Web3(config.provider);

        cpoWallet = new Wallet(seed1);
        mspWallet = new Wallet(seed2);

        TestHelper.ensureFunds(web3, cpoWallet);
        TestHelper.ensureFunds(web3, mspWallet);
    });

    beforeEach(async () => {
    });

    afterEach(async () => {
        EventPollerService.instance.removeAll();
    });

    context('#stations', async () => {
        it('should broadcast charge start confirmation', async () => {
            let shareCharge = resolve();

            let connector = new ConnectorBuilder().build();
            await shareCharge.connectors.useWallet(cpoWallet).create(connector);

            let connectorId = "";
            let controller = "";

            shareCharge.on("StartConfirmed", (id, address) => {
                connectorId = id;
                controller = address;
            });

            await shareCharge.charging.useWallet(mspWallet).requestStart(connector, 60);

            await EventPollerService.instance.poll();

            // expect(connectorId).to.equal(connector.id);
            // expect(controller).to.equal(connector.controller);

        });

        it('should broadcast connector created and updated events', async () => {
            let shareCharge = resolve();

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
            let shareCharge = resolve();

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

