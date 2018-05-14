import { ShareCharge } from '../src/shareCharge';
import { Wallet } from '../src/models/wallet';
import { TestHelper } from '../test/testHelper';

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const cpoWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
const mspWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');
const driverWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cold');

console.log('CPO:', cpoWallet.keychain[0].address);
console.log('MSP:', mspWallet.keychain[0].address);
console.log('Driver:', driverWallet.keychain[0].address);

TestHelper.ensureFunds(web3, cpoWallet.keychain[0])
    .then(() => TestHelper.ensureFunds(web3, mspWallet.keychain[0])
    .then(() => TestHelper.ensureFunds(web3, driverWallet.keychain[0])
    .then(() => console.log('Funded CPO, MSP and Driver wallets'))));
