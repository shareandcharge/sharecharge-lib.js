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

describe.only('TokenService', function () {

    this.timeout(30 * 1000);

    const defs = ToolKit.contractDefsForStage(config.stage);

    let tokenService: TokenService, wallet: Wallet, contract: Contract, web3;

    wallet = Wallet.generate().wallet;

    before(async () => {
        web3 = new Web3(config.ethProvider);
        await TestHelper.ensureFunds(web3, wallet.keychain[0]);
    });

    before(async () => {
        contract = await TestHelper.createContract(web3, config, defs["MSPToken"], ["MSPToken", "MSP"]);
        tokenService = new TokenService(new ContractProvider(new ConfigProvider({ tokenAddress: contract.address })));
    });

    it('should deploy new MSP token', async () => {
        const address = await tokenService.useWallet(wallet).deploy('My special MSP Token', 'MSP');
        expect(address).to.not.equal(undefined);
        const owner = await tokenService.getOwner();
        expect(owner.toLowerCase()).to.equal(wallet.coinbase);
    });

    it('should mint tokens for user', async () => {
        const wallet2 = Wallet.generate().wallet;
        const address = wallet2.coinbase;
        await tokenService.useWallet(wallet).deploy('My special MSP Token', 'MSP');
        await tokenService.useWallet(wallet).mint(address, 10);
        const balance = await tokenService.getBalance(address);
        expect(balance).to.equal(10);
    });

    it('should re-initialise the token service instance with a new token address', async () => {
        const address = tokenService.address;
        await tokenService.useWallet(wallet).deploy('MSPToken', 'MSP');
        expect(tokenService.address).to.not.equal(address);
        tokenService.address = address;
        expect(tokenService.address).to.equal(address);
    });

});
