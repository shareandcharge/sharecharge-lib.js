API description
---------------

**Wallet**

To add charge points and request/confirm charging sessions on the
network, it is necessary to first create a wallet. This wallet needs to
be funded with Ether in order to pay the blockchain's transaction fees.

A wallet can be generated using either a new or known 12 word seed
phrase. This seed phrase allows a user to regain access to their wallet
should they lose it.

*Example Usage (in TypeScript)*

```ts
import { Wallet } from 'sharecharge-lib';

// generate new seed and keypair
let newWallet = Wallet.generate();

// get seed of new wallet
newWallet.seed
// 'maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid'

// get generated wallet object
let wallet = newWallet.wallet
wallet.coinbase;
// 0x6aded10b71224ca208f7476cebd72270771a451e

// alternatively, generate from seed
wallet = new Wallet('maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid');

wallet.coinbase;
// 0x6aded10b71224ca208f7476cebd72270771a451e

// add new key to the keychain
wallet.addKey('maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid');
// true
```

------------------------------------------------------------------------

**ShareCharge**

The `ShareCharge` module is the entry point to the network, allowing
access to charging, token and storage contracts.

*Construction*

The module has a default configuration object:

```ts
const config = {
    stage: 'local',
    ethProvider: 'http://localhost:8545';
}
```

*Retrieving instance*

```ts
import { ShareCharge } from 'sharecharge-lib';

// get instance of ShareCharge class with overwritten configuration value
const sc = ShareCharge.getInstance({ stage: 'test' });
```

*Example usage*

```ts
const request = sc.charging.useWallet(myWallet).requestStart();
request.scId = '0x123...';
request.evse = 'DE-1234';
request.connector = '1';
request.tariff = 'ENERGY';
request.chargeUnits = 5000;
request.mspToken = '0x123..';
request.estimatedPrice = 100;
await request.send();
```

------------------------------------------------------------------------



------------------------------------------------------------------------

`ShareCharge.charging`

-   `useWallet(wallet: Wallet).requestStart()`

    > Request a start at an EVSE, specifying the token contract to use
    > and the estimated price of charging

-   `useWallet(wallet: Wallet).confirmStart()`

    > Confirm a start on an EVSE.

-   `useWallet(wallet: Wallet).requestStop()`

    > Request a stop at an EVSE.

-   `useWallet(wallet: Wallet).confirmStop()`

    > Confirm a stop on an EVSE.

-   `useWallet(wallet: Wallet).chargeDetailRecord()`

    > Issue a charge detail record for a charging session.

-   `useWallet(wallet: Wallet).logError()`

    > Notify the network that an error occurred with the charging
    > session for a given evse. Error codes are TBC.

------------------------------------------------------------------------

`ShareCharge.store`

-   `getLocationById(cpoId: string, locationId: string)`

    > Get a charge point by CPO address and share&charge ID.

-   `getLocationsByCPO(cpoId: string)`

    > Get all charge points by CPO address.

-   `getAllTariffsByCPO(cpoId)`

    > Get tariffs information by CPO address.

-   `useWallet(wallet: Wallet).addLocation(data: any)`

    > Add charge point data.

-   `useWallet(wallet: Wallet).updateLocation(scId: string, data: any)`

    > Update charge point data.

-   `useWallet(wallet: Wallet).addTariffs(data: any)`

    > Add CPO tariffs data.

-   `useWallet(wallet: Wallet).updateTariffs(data: any)`

    > Update CPO tariffs data.

------------------------------------------------------------------------

`ShareCharge.msp`

-   `getBalance(address: string)`

    > Get balance of a particular address.

-   `useWallet(wallet: Wallet).deploy(name: string, symbol: string)`

    > Deploy new MSP token with a particular name and symbol.

-   `useWallet(wallet: Wallet).setAccess(chargingContractAddress: string)`

    > Grant a certain charging contract access to the MSP token.

-   `useWallet(wallet: Wallet).mint(address: string, value: number)`

    > Mint tokens for a certain address.


--------------------------------------------------------------------------

`ShareCharge.evt`

-   `getBalance(address: string)`

    > Get balance of a particular address.

-   `useWallet(wallet: Wallet).mint(address: string, value: number)`

    > Mint tokens for a certain address (Note: only owner can do this).

-   `useWallet(wallet: Wallet).transfer(address: string, value: number)`

    > Transfer tokens from one wallet to another (via its address)
