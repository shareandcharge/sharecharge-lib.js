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
import { Symbols } from '../../src/symbols';
import { Container, injectable, inject } from "inversify";
import "reflect-metadata";
import { PlugType } from '../../src/models/plugType';
import { EventPoller } from '../../src/services/eventPoller';
import { IoC } from '../../src/ioc';
import { TestHelper } from '../testHelper';
import { Contract } from '../../src/models/contract';

const Web3 = require('web3');
const config = new ConfigProvider();

describe('IoC', function () {

    const seed = 'filter march urge naive sauce distance under copy payment slow just cool';
    const wallet = new Wallet(seed);
    const key = wallet.keychain[0];
    const contractDefs = ToolKit.contractDefsForStage(config.stage);

    before(async () => {
        const web3 = new Web3(config.provider);
        await TestHelper.ensureFunds(web3, key);

        const coinbase = await web3.eth.getCoinbase();

        const evseContract = await TestHelper.createContract(web3, config, contractDefs["EvseStorage"]);
        const evseService = new EvseService(<IContractProvider>{
            obtain(key: string): Contract {
                return evseContract;
            }
        });

        const stationContract = await TestHelper.createContract(web3, config, contractDefs["StationStorage"]);
        const stationService = new StationService(<IContractProvider>{
            obtain(key: string): Contract {
                return stationContract;
            }
        });

        const chargingContract = await TestHelper.createContract(web3, config, contractDefs["Charging"], [evseContract.address]);
        const chargingService = new ChargingService(<IContractProvider>{
            obtain(key: string): Contract {
                return chargingContract;
            }
        });

        await evseContract.native.methods["setAccess"](chargingContract.address).send({ from: coinbase });

        IoC.getContainer().rebind<IContractProvider>(Symbols.ContractProvider)
            .toConstantValue(<IContractProvider>{
                obtain(key: string): Contract {
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

