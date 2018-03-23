import { IContractProvider } from './../../src/services/contractProvider';
import { ToolKit } from './../../src/utils/toolKit';
import { expect } from 'chai';

import { ShareCharge } from '.././../src/shareCharge';
import { Station } from '../../src/models/station';
import { ChargingService } from '../../src/services/chargingService';
import { Evse } from '../../src/models/evse';
import { EvseService } from '../../src/services/evseService';
import { StationService } from '../../src/services/stationService';
import { ConfigProvider } from '../../src/services/configProvider';
import { ContractProvider } from '../../src/services/contractProvider';
import { Wallet } from '../../src/models/wallet';
import { Symbols } from '../../src/models/symbols';
import { Container, injectable, inject } from "inversify";
import "reflect-metadata";
import { PlugType } from '../../src/models/plugType';
import { EventPoller } from '../../src/services/eventPoller';
import { IoC } from '../../src/ioc';
import { TestHelper } from '../testHelper';
import { config } from "../../src/utils/config";
import { Contract } from '../../src/models/contract';

const Web3 = require('web3');

describe('IoC', function () {

    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';
    const wallet = new Wallet(seed);

    before(async () => {
        const web3 = new Web3(config.provider);
        await TestHelper.ensureFunds(web3, wallet);

        const contractDefs = ToolKit.contractDefsForStage(config.stage);

        const testContractProvider = TestHelper.getTestContractProvider(web3, config, contractDefs);

        const stationContract = await testContractProvider.obtain("StationStorage");
        const evseContract = await testContractProvider.obtain("EvseStorage");

        const testContractProvider2 = TestHelper.getTestContractProvider(web3, config, contractDefs, [evseContract.address]);
        const chargingContract = await testContractProvider2.obtain("Charging");

        const coinbase = await web3.eth.getCoinbase();
        await evseContract.native.methods["setAccess"](chargingContract.address).send({ from: coinbase });

        IoC.getContainer().rebind<IContractProvider>(Symbols.ContractProvider)
        .toConstantValue(<IContractProvider>{
            async obtain(key: string): Promise<Contract> {
                switch (key) {
                    case "StationStorage":
                        return stationContract;
                    case "EvseStorage":
                        return evseContract;
                    default:
                        return chargingContract;
                }
            }
        });
    });

    it('should resolve', async () => {
        const shareCharge: ShareCharge = await IoC.resolve();
        await shareCharge.hookup();

        const station = new Station();
        await shareCharge.stations.useWallet(wallet).create(station);

        const station1 = await shareCharge.stations.getById(station.id);
        expect(station1.latitude).to.equal(station.latitude);

        const evse = new Evse();
        evse.stationId = station.id;
        evse.plugTypes = [PlugType.CCS];
        await shareCharge.evses.useWallet(wallet).create(evse);

        let evseUpdatedId = "";
        await shareCharge.on("EvseUpdated", async (result) => {
            evseUpdatedId = result.evseId;
        });

        await shareCharge.charging.useWallet(wallet).requestStart(evse, 10);

        await EventPoller.instance.poll();

        expect(evseUpdatedId).to.equal(evse.id);
    });

});

