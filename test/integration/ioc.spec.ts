import { expect } from 'chai';

import { ShareCharge } from '.././../src/shareCharge';
import { Station } from '../../src/models/station';
import { ChargingService } from '../../src/services/chargingService';
import { Connector } from '../../src/models/connector';
import { ConnectorService } from '../../src/services/connectorService';
import { StationService } from '../../src/services/stationService';
import { ConfigProvider } from '../../src/services/configProvider';
import { ContractProvider } from '../../src/services/contractProvider';
import { Wallet } from '../../src/models/wallet';
import { Symbols } from '../../src/models/symbols';
import { Container, injectable, inject } from "inversify";
import "reflect-metadata";
import { PlugType } from '../../src/models/plugType';
import { EventPoller } from '../../src/services/eventPoller';
import { IoC } from '../../src';
import { TestHelper } from '../testHelper';
import { config } from "../../src/utils/config";

const Web3 = require('web3');

describe('IoC', function () {

    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';
    const wallet = new Wallet(seed);

    before(async () => {
        const web3 = new Web3(config.provider);
        await TestHelper.ensureFunds(web3, wallet);
    });

    it('should resolve', async () => {
        const shareCharge = await IoC.resolve();
        await shareCharge.hookup();

        const station = new Station();
        await shareCharge.stations.useWallet(wallet).create(station);

        const station1 = await shareCharge.stations.getById(station.id);
        expect(station1.latitude).to.equal(station.latitude);

        const connector = new Connector();
        connector.stationId = station.id;
        connector.plugTypes = [PlugType.CCS];
        await shareCharge.connectors.useWallet(wallet).create(connector);

        let connectorUpdatedId = "";
        await shareCharge.on("ConnectorUpdated", async (result) => {
            connectorUpdatedId = result.connectorId;
        });

        await shareCharge.charging.useWallet(wallet).requestStart(connector, 10);

        await EventPoller.instance.poll();

        expect(connectorUpdatedId).to.equal(connector.id);
    });

});

