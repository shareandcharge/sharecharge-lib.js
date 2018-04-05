import * as mocha from 'mocha';
import { expect } from 'chai';
import { ConfigProvider } from "../../src/services/configProvider";
import { Key } from '../../src/models/key';
import { Wallet } from '../../src/models/wallet';
import { TokenService } from '../../src/services/tokenService';
import { TestHelper } from '../testHelper';
import { ToolKit } from '../../src/utils/toolKit';
import { Contract } from '../../src/models/contract';
import { ContractProvider } from '../../src/services/contractProvider';
const Web3 = require('web3');
const config = new ConfigProvider();

describe('TokenService', function () {

    const defs = ToolKit.contractDefsForStage(config.stage);

    let tokenService: TokenService, wallet: Wallet, key: Key, contract: Contract, web3, coinbase;

    before(async () => {
        web3 = new Web3(config.provider);
        coinbase = await web3.eth.getCoinbase();
    });

    beforeEach(async () => {
        contract = await TestHelper.createContract(web3, config, defs["MSPToken"], ["MSPToken", "MSP"]);

        tokenService = new TokenService(<ContractProvider>{
            obtain(key: string): Contract {
                return contract;
            }
        });
    });

    it('should get balance of key', async () => {
        const wallet = new Wallet('seed');
        await contract.native.methods["mint"](wallet.keychain[0].address, 10).send({ from: coinbase });
        const balance = await tokenService.balance(wallet);
        expect(balance).to.equal(10);

    });

});
