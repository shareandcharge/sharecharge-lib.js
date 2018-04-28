import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';

const Web3 = require('web3');

import { TestHelper } from '../testHelper';
import { Wallet } from '../../src/models/wallet';
import { Contract } from '../../src/models/contract';
import { ConfigProvider } from "../../src/services/configProvider";
import { ToolKit } from './../../src/utils/toolKit';
import { Key } from '../../src/models/key';
import { ContractProvider } from '../../src/services/contractProvider';
import { StorageService } from '../../src/services/storageService';
import { IpfsProvider } from '../../src/services/ipfsProvider';
import { Ipfs } from '../../src/models/ipfs';

const config = new ConfigProvider();
const ocpiLocation = require('../data/ocpiLocation.json');
const ocpiTariffs = require('../data/ocpiTariffs.json');

describe('StorageService', function () {

    this.timeout(10 * 1000);
    const batchTimeout = 500;

    let storageService: StorageService, wallet: Wallet, key: Key, web3;

    const defs = ToolKit.contractDefsForStage(config.stage);
    const seed = 'filter march urge naive sauce distance under copy payment slow just warm';


    before(async () => {
        web3 = new Web3(config.ethProvider);
        wallet = new Wallet(seed);
        key = wallet.keychain[0];
        await TestHelper.ensureFunds(web3, key);
    });

    beforeEach(async () => {
        const contract = await TestHelper.createContract(web3, config, defs["ExternalStorage"]);
        storageService = new StorageService(
            <ContractProvider>{
                obtain(key: string): Contract {
                    return contract;
                }
            }, <IpfsProvider>{
                obtain(): any {
                    return {
                        add: async (content: any) => {
                            return {
                                ipfs: 'QmUVB2FKuQ66s5Fueu6BBX5Nsxf1eVXcif5dq3qPKeRFLj',
                                solidity: '0x5b550af4e10a5631201589b74703d5d2217efbfadc4a8816eee55696f3b4cc40'
                            };
                        },
                        get: async (hash: string) => { return ocpiLocation; }
                    };
                }
            }
        );
    });

    context('#addLocation()', () => {
        it('should add location to storage', async () => {
            const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
            const location = await storageService.getLocationById(key.address, result.globalId);
            expect(location.id).to.equal(ocpiLocation.id);
        });

        it('should bulk add locations', async () => {
            const locs = [];
            for (let i = 0; i < 10; i++) {
                locs[i] = ocpiLocation;
            }
            const ids = await storageService.useWallet(wallet).batch().addLocations(...locs);
            expect(ids.length).to.equal(10);
            const storedLocations = await storageService.getLocationsByCPO(key.address);
            expect(storedLocations.length).to.equal(10);
        });

    });

    context('#updateLocation()', () => {
        it('should update location in storage', async () => {
            const result = await storageService.useWallet(wallet).addLocation(ocpiLocation);
            ocpiLocation.id = 'LOC2';
            const result2 = await storageService.useWallet(wallet).updateLocation(result.globalId, ocpiLocation);
            expect(result2.globalId).to.equal(result.globalId);
            expect(result2.ipfs).to.not.equal(undefined);
        });
    });

    context('#addTariffs()', () => {
        it('should add tariffs to storage', async () => {
            const result = await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
            expect(result).to.not.equal(undefined);
            const result2 = await storageService.getTariffsByCPO(key.address);
            expect(result2['id']).to.not.equal(undefined);
        });
    });

    context('#updateTariffs()', () => {
        it('should update tariffs in storage', async () => {
            await storageService.useWallet(wallet).addTariffs(ocpiTariffs);
            ocpiTariffs.id = '12';
            const result = await storageService.useWallet(wallet).updateTariffs(ocpiTariffs);
            expect(result).to.not.equal(undefined);
        });
    });

});