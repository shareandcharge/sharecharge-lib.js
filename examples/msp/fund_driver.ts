import { ShareCharge, Wallet } from '../../src/index';
import config from '../config/example';

const mspWallet = new Wallet('seed phrase for msp wallet');
const driverWallet = new Wallet('seed phrase for driver wallet');

// it is recommended to deploy new MSP token contracts through the Share & Charge CLI - we assume the library is already configured to use the correct token contract
const sc = ShareCharge.getInstance(config);

// each token is worth 1 decimal coin (or lowest unit) of a country's currency, e.g. 1 token = 1 cent, so here we fund a driver 10 euros
sc.token.useWallet(mspWallet).mint(driverWallet.coinbase, 1000)
    .then(receipt => {/* handle successful minting of tokens here */})
    .catch(err => console.log(err.message));


// deploy new token programatically
sc.token.useWallet(mspWallet).deploy('My New Token', 'NMT')
    // grant the charging contract access to the new MSP token contract
    .then(receipt => sc.token.useWallet(mspWallet).setAccess(sc.charging.address)
        // mint 5 euros for the driver using the new contract
        .then(receipt => sc.token.useWallet(mspWallet).mint(driverWallet.coinbase, 500)));