# Share & Charge Library


This is the Library for interacting with the Share & Charge EV Network.
It can be implemented in a browser or server environment, for example by
the Share & Charge CPO Core Client or by an eMobility Service Provider's
mobile app. This is the reference implementation written in TypeScript.

    npm install @motionwerk/sharecharge-lib

------------------------------------------------------------------------

## Usage

In order to get started, first obtain an instance of the Share & Charge library. 

A configuration object can be used as an argument to overwite default configuration values. See config options [here](https://github.com/motionwerkGmbH/sharecharge-lib/tree/domain/examples/config/)

**IMPORTANT**: Consider the network you wish to interact with. The node
you connect to must have the same contracts as specified in the stage.
For example, if you are connecting to an Energy Web Foundation Tobalaba
client (shown below as a locally-running node), specify the tobalaba
stage to interact with the Share & Charge contracts deployed on that
network.

```ts
import { ShareCharge } from '@motionwerk/sharecharge-lib';

const config = {
    stage: 'tobalaba',
    ethProvider: 'http://localhost:8545',
}

const sc = ShareCharge.obtain(config);
```

### Retrieving data

Most methods in the Share & Charge library fall into two categories: calls and transactions. 

Calls are used to retrieve data from smart contracts and do not require a wallet (i.e. they do not cost anything).

These methods are asynchronous and therefore return a promise. 

```ts
// in this example, location IDs are returned, relating to a Charge Point Operator's wallet address
sc.store.getIdsByCPO('0x3d3e776f83ccf6aa443b8bd5b6f245dd429f94e9')
    .then(console.log)
    .catch((err: Error) => /* catch error here */);

/*
    [
        "0x2d33312e3933373331382c3131352e373535373939"
    ]
*/
```

### Creating a wallet

In order to perform transactions on Share & Charge smart contracts, it is necessary to first create a wallet. 

Transactions are any contract function calls which change the state of the Ethereum Virtual Machine. (i.e. adding a location to the network or confirming a charge detail record).
```ts
import { Wallet } from '@motionwerk/sharecharge-lib';

const wallet = Wallet.generate();
/*
    {
        seed: 'maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid',
        wallet: {
            keychain: [ [Key] ],
            path: 'm/44\'/60\'/0\'',
            id: '0x0ebcd1064481b184f933856f4b9d8a4403df4cbe'
        } 
    }
*/

wallet.coinbase
// 0x3d3e776f83ccf6aa443b8bd5b6f245dd429f94e9
```

The wallet can store many different keys, each of which can make transactions. These keys are *hierarchical deterministic* - they are restored each time using the same seed. It is therefore necessary to keep the seed safe and preferably offline. 

Because managing multiple keys (each of which need a balance of an Ethereum blockchain's native cryptocurrency) is difficult, for the most part it is advised to simply use the wallet's primary key, its coinbase. Keys can be funded in a number of ways, via exchanges or faucets depending on the stage being used.

Upon restoring a wallet, the same wallet object will be returned:
```ts
const wallet = new Wallet('maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid');
wallet.coinbase
// 0x3d3e776f83ccf6aa443b8bd5b6f245dd429f94e9
```

### Writing data

Transactions require a wallet object containing a funded key at the index specified. By default, the coinbase is used.

```ts
sc.store.useWallet(wallet).addLocation(/* OCPI location object */)
    .then(receipt => /* handle success here */)
    .catch(err => /* handle error here */);
```

You may also specify another key on the wallet's "keychain" to use, e.g.
```ts
sc.store.useWallet(wallet, 3)
```
This translates to the key at index 3 here:
```ts
wallet.keychain[3]
```

Transaction reverts can happen when conditions in smart contracts are not met. Not every Ethereum client supports revert error messages - see [transaction errors](#transaction-errors) for more information. 


### eMobility Service Providers (MSPs)

The major functionality provided by the Share & Charge library for MSPs is:
- provisioning wallets (i.e. for drivers)
- obtaining location data
- obtaining tariff data
- provisioning an MSP token contract
- minting MSP tokens for drivers
- requesting charge session start
- requesting charge session stop
- subscribing to charge start confirmations
- subscribing to charge stop confirmations
- subscribing to charge detail records

Because charging requests can be a more complex than other transactions, a request object has to be built:
```ts
const tx = sc.charging.useWallet(wallet).requestStart();
tx.scId = '0x2d33312e3933373331382c3131352e373535373939';
tx.evse = 'DE-1234-X';
tx.connector = '1';
tx.tariff = 'TIME';
tx.chargeUnits = 3600;
tx.tokenAddress = sc.token.address;
tx.estimatedPrice = 120;
await tx.send();
```

**Note**: examples of specific MSP usage can be found [here](https://github.com/motionwerkGmbH/sharecharge-lib/tree/domain/examples/msp/).

### Charge Point Operators (CPOs)
    
The major functionality provided by the Share & Charge library for CPOs is:
- adding location data
- adding tariff data
- subscribing to session start requests
- subscribing to session stop requests
- confirming start requests
- confirming stop requests
- issuing charge detail records

A charging session start request can be subscribed to as follows:
```ts
sc.on('StartRequested', async (startRequest: ISession) => {
    if (myIDs.includes(startRequest.scId)) {
        const response = backend.remoteStartTransaction(startRequest.evseId);
        if (response.success) {
            const tx = sc.charging.useWallet(wallet).confirmStart();
            tx.scId = startRequest.scId;
            tx.evse = startRequest.evseId;
            tx.sessionId = response.sessionId;
            await tx.send();
        }
    }
});
```

**Note**: examples of specific CPO usage can be found [here](https://github.com/motionwerkGmbH/sharecharge-lib/tree/domain/examples/cpo/).

### Events

The following events are emitted by the smart contracts:

- **An EV driver wishes to start or stop charging at a particular location**

```
event StartRequested(
    bytes32 scId, 
    bytes32 evseId, 
    bytes32 connectorId, 
    address controller, 
    uint8 tariffType, 
    uint chargeUnits, 
    uint estimatedPrice
);

event StopRequested(
    bytes32 scId, 
    bytes32 evseId, 
    address controller, 
    string sessionId
);
```

- **A CPO has confirmed the start or stop of a charging session**

```
event StartConfirmed(
    bytes32 scId, 
    bytes32 evseId, 
    address controller, 
    string sessionId
);

event StopConfirmed(
    bytes32 scId, 
    bytes32 evseId,
    address controller
);
```

- **A CPO has issued a charge detail record for a session**
```
event ChargeDetailRecord(
    bytes32 scId, 
    bytes32 evseId, 
    string sessionId,
    address controller, 
    uint8 tariffType, 
    uint chargedUnits, 
    uint startTime, 
    uint endTime, 
    address tokenAddress, 
    uint finalPrice
);
```

- **An error has occurred during a charging session**
```
event Error(
    bytes32 scId, 
    bytes32 evseId, 
    address controller, 
    uint8 errorCode
);
```

- **A CPO has added, updated or delete a location**
```
event LocationAdded(
    address cpo, 
    bytes32 scId
);

event LocationUpdated(
    address cpo, 
    bytes32 scId
);

event LocationDeleted(
    address cpo, 
    bytes32 scId
);
```

- **A CPO has added or updated their tariffs**
```
event TariffsAdded(
    address cpo
);

event TariffsUpdated(
    address cpo
);
```

------------------------------------------------------------------------

## [Transaction errors](#transaction-errors)

Transactions can fail for a variety of reasons. Some occur on the core Ethereum protocol, for example when an account does not have the necessary funds to pay for a transaction. This can be solved by visiting a faucet and requesting funds. 

This section looks into common errors on the smart contract level. Revert messages are not always clear, but there are steps which can be taken to mitigate these issues.

The following conditions should be met:

### `[charging] requestStart`
- The `scId` should exist on the Share & Charge network
- The driver requesting the charging session start should hold the tokens necessary to pay for the `estimatedPrice` on the MSP token contract specified (i.e. the `tokenAddress`)
- The MSP token contract should grant access to the charging contract. By default the library does not link newly deployed MSP tokens with the current charging contract. It is recommended to use the [sharecharge-cli](https://github.com/motionwerkGmbH/sharecharge-cli) for deploying new MSP token contracts. This can however be done progrmatically in a seperate transaction:
```ts
sc.token.useWallet(wallet).deploy('My New MSP Token', 'NMT')
    .then(async (address: string) => {
        // set the tokenAddress for the current ShareCharge object
        sc.token.address = address;
        // grant the charging contract access to the new MSP token
        await sc.token.useWallet(wallet).setAccess(sc.charging.address)
    });
```

### `[charging] confirmStart`
- Only the CPO of a location may confirm a start on its `scId`

### `[charging] requestStop`
- Only the driver (`controller`) may request a stop on their charging session

### `[charging] chargeDetailRecord`
- If the final session price is greater than the estimated price, the transaction will revert because the driver does not have enough funds in the escrow account to pay for the charge. Prices should be calculated using the tariff object returned from the library's `store` module:
```ts
sc.store.getAllTariffsByCPO('0x3d3e776f83ccf6aa443b8bd5b6f245dd429f94e9')
    .then(async (tariffs: { [id: string]: Tariff }) => {
        // the correct tariff ID can be found on the OCPI Connector object.
        const tariff = tariffs[id];
        // calculate the price of a 1 hour charging session on a time-based tariff
        const estimatedPrice = tariff.calculatePrice('TIME', 3600);
        const tx = sc.charging.useWallet(wallet).requestStart();
        tx.estimatedPrice = estimatedPrice;
        await tx.send();
    });
```
- Note that bridges will often take the estimated price in the case that a charging session has run over the specified session consumption or duration. To be on the safe side, it is possible to increase the estimate. On the event that the final CDR price is lower than the estimate, the remaining unspent tokens will be returned to the driver's wallet. 

### `[token] mint`
- Only the owner of an MSP token contract can mint those tokens for drivers

------------------------------------------------------------------------

## Other Notes

- All data added through the `store` module of the Share & Charge library should be in OCPI format. 
    - [Locations](https://github.com/ocpi/ocpi/blob/master/mod_locations.md#3-object-description)
    - [Tariffs](https://github.com/ocpi/ocpi/blob/master/mod_tariffs.md#3-object-description)
- The `store` module returns deserialized location and tariff objects on data retrieval. These objects contain helpful functions, e.g. calculating price of a tariff with certain conditions.
- Type checking for the above deserialized objects and more can be found in [sharecharge-common](https://github.com/motionwerkGmbH/sharecharge-common)
- One time transactions (e.g. deploying a new MSP token contract) are better suited for the [sharecharge-cli](https://github.com/motionwerkGmbH/sharecharge-cli)


------------------------------------------------------------------------


## Local Development Setup

**Blockchain**

An Ethereum client should be running in the background. A popular choice
for development and testing is `ganache-cli` because of its instant
sealing, however parity or geth in development mode can also be used to
provide conditions closer to a live environment (with Proof of Authority
consensus and configurable block sealing times). 

    npm install -g ganache-cli
    ganache-cli

**IPFS**

An ipfs client should also be running in the background. You can find
installation instructions [here](https://ipfs.io/docs/getting-started/).

**sharecharge-lib**

Install for development:

    git clone git@github.com:motionwerkGmbH/sharecharge-lib.git
    cd sharecharge-lib
    npm install
    npm test

Assuming the tests passed, the library is now ready to interact with the
Share & Charge EV Network.

