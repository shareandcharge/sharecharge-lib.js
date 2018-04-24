import { ShareCharge } from '../src/shareCharge';
import { Wallet } from '../src/models/wallet';

// specify address to interact with previously deployed token contract
const sc: ShareCharge = ShareCharge.getInstance({ tokenAddress: '' });
const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

// no token currently - will throw error when interacting with it
sc.token.balance(wallet.keychain[0].address).then(console.log).catch(err => console.log('error obtaining balance'));

console.log(`Creating wallet with address: ${wallet.keychain[0].address}`);

sc.token.useWallet(wallet).deploy("MSPToken", "MSP")
    .then(async (address) => {
        console.log(`New MSP token created at ${address}`);
        const owner = await sc.token.owner();
        console.log(`Owner of token: ${owner}`);
    }).catch(err => {
        console.log(err.message);
    });
