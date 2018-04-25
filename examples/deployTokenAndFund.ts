import { ShareCharge } from '../src/shareCharge';
import { Wallet } from '../src/models/wallet';
import { TestHelper } from '../test/testHelper';

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

// need to grant Charging contract access to the newly deployed token contract
const chargingAddress = require('@motionwerk/sharecharge-contracts/contract.defs.local.json').Charging.address;

// specify address to interact with previously deployed token contract
const sc: ShareCharge = ShareCharge.getInstance({ tokenAddress: '' });

const cpoWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
const mspWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

// no token currently - will throw error when interacting with it
// sc.token.balance(wallet.keychain[0].address).then(console.log).catch(err => console.log('error obtaining balance'));

sc.token.useWallet(mspWallet).deploy("GenericMSPToken", "GMT")
    .then(async (address) => {
        await TestHelper.ensureFunds(web3, cpoWallet.keychain[0]);
        console.log('Funded CPO Wallet');
        await TestHelper.ensureFunds(web3, mspWallet.keychain[0]);
        console.log('Funded MSP Wallet');

        console.log(`MSPToken Contract created at ${address}`);
        const owner = await sc.token.owner();
        console.log(`Owner of MSPToken: ${owner}`);
        await sc.token.useWallet(mspWallet).setAccess(chargingAddress);
        console.log('Granted Charging Contract access to MSP Token');
    }).catch(err => {
        console.log(err.message);
    });
