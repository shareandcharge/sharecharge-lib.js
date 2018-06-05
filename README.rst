======================
Share & Charge Library
======================

This is the Library for interacting with the Share & Charge EV Network. It can be implemented in a browser or server environment, for example by the Share & Charge CPO Core Client or by an eMobility Service Provider's mobile app. This is the reference implementation written in TypeScript.

::

    npm install @motionwerk/sharecharge-lib


----

Usage
-----

See the `examples <https://github.com/motionwerkGmbH/sharecharge-lib/tree/domain/examples>`__ directory for eMobility Service Provider and Charge Point Operator-specific usage.

**IMPORTANT**: Consider the network you wish to interact with. The node you connect to must have the same contracts as specified in the stage. For example, if you 
are connecting to an Energy Web Foundation Tobalaba client (shown below as a locally-running node), specify the `tobalaba` stage to interact with the Share & Charge
contracts deployed on that network. 

.. code-block:: typescript

    import { ShareCharge } from '@motionwerk/sharecharge-lib';

    const config = {
        stage: 'tobalaba',
        ethProvider: 'http://localhost:8545',
    }

    const sc = ShareCharge.obtain(config);

----

Local Development Setup
-----

**Blockchain**

An Ethereum client should be running in the background. A popular choice for development and testing is ``ganache-cli`` because of its instant sealing, however parity or geth in development mode can also be used to provide conditions closer to a live environment (with Proof of Authority consensus and configurable block sealing times).

::

    npm install -g ganache-cli
    ganache-cli


..

**IPFS**

An ipfs client should also be running in the background. You can find installation instructions `here <https://ipfs.io/docs/getting-started/>`__.

**sharecharge-contracts**

The Share & Charge library depends on `@motionwerk/sharecharge-contracts <https://github.com/motionwerkGmbH/sharecharge-contracts>`__. This package provides definitions of the smart contracts used to store and interact with Charge Points on the Share & Charge EV network. Definitions can be overwritten to point the library to a different network, for example your local development environment. 

::

    git clone git@github.com:motionwerkGmbH/sharecharge-contracts.git
    cd sharecharge-contracts
    npm install
    truffle migrate
    node bin/publish.js
    cp contract.defs.local.json <LIBRARY_PATH>/node_modules/@motionwerk/sharecharge-contracts/

..

**sharecharge-lib**


Install for development:

::

    git clone git@github.com:motionwerkGmbH/sharecharge-lib.git
    cd sharecharge-lib
    npm install
    npm test

Assuming the tests passed, the library is now ready to interact with the Share & Charge EV Network.

----

API description
---------------

**Wallet**

To add charge points and request/confirm charging sessions on the network, it is necessary to first create a wallet. This wallet needs to be funded with Ether in order to pay the blockchain's transaction fees.

A wallet can be generated using either a new or known 12 word seed phrase. This seed phrase allows a user to regain access to their wallet should they lose it.

*Example Usage (in TypeScript)*

.. code-block:: typescript

    import { Wallet } from 'sharecharge-lib';

    // generate new seed and keypair
    let newWallet = Wallet.generate();

    // get seed of new wallet
    newWallet.seed
    // 'maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid'

    // get generated wallet object
    let wallet = newWallet.wallet
    wallet.keychain[0].address;
    // 0x6aded10b71224ca208f7476cebd72270771a451e

    // alternatively, generate from seed
    wallet = new Wallet('maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid');

    wallet.keychain[0].address;
    // 0x6aded10b71224ca208f7476cebd72270771a451e

    // add new key to the keychain
    wallet.addKey('maid left ostrich minor ask stomach outdoor vacuum beach admit dinner avoid');
    // true

----

**ShareCharge**

The ``ShareCharge`` module is the entry point to the network, allowing access to charging, token and storage contracts.

*Construction*

The module has a default configuration object:

.. code-block:: typescript

    const config = {
        stage: 'local',
        ethProvider: 'http://localhost:8545';
        ipfsProvider: '/ip4/127.0.0.1/tcp/5001';
        gasPrice: 18000000000;
        pollingInterval: 1000;
        tokenAddress: "";
    }

*Retrieving instance*

.. code-block:: typescript

    import { ShareCharge } from 'sharecharge-lib';

    // get instance of ShareCharge class with overwritten configuration value
    const sc = ShareCharge.getInstance({ stage: 'test' });


*Example Usage*

see `examples <https://github.com/motionwerkGmbH/sharecharge-lib/tree/domain/examples>`__

----

The following events are subscribable:

- ``LocationAdded``
- ``LocationUpdated``
- ``EvseAvailabilityUpdated``
- ``StartRequested``
- ``StartConfirmed``
- ``StopRequested``
- ``StopConfirmed``
- ``ChargeDetailRecord``
- ``Error``

----

``sc.charging``

- ``useWallet(wallet: Wallet).requestStart(scId: string, evseId: string, tokenAddress: string, estimatedPrice: number)``

    Request a start at an EVSE, specifying the token contract to use and the estimated price of charging 

- ``useWallet(wallet: Wallet).confirmStart(scId: string, evseId: string, sessionId: string)``

    Confirm a start on an EVSE.

- ``useWallet(wallet: Wallet).requestStop(scId: string, evseId: string)``

    Request a stop at an EVSE.

- ``useWallet(wallet: Wallet).confirmStop(scId: string, evseId: string)``

    Confirm a stop on an EVSE.

- ``useWallet(wallet: Wallet).chargeDetailRecord(scId: string, evseId: string, finalPrice: number)``

    Issue a charge detail record for a charging session.

- ``useWallet(wallet: Wallet).logError(scId: string, evseId: string, errorCode: number)``

    Notify the network that an error occurred with the charging session for a given evse. Error codes are TBC.

----

``sc.store``

- ``getLocationById(cpoId: string, locationId: string)``

    Get a charge point by CPO address and share&charge ID.

- ``getLocationsByCPO(cpoId: string)``

    Get all charge points by CPO address.

- ``getTariffsByCPO(cpoId)``

    Get tariffs information by CPO address.

- ``useWallet(wallet: Wallet).addLocation(data: any)``

    Add charge point data.

- ``useWallet(wallet: Wallet).updateLocation(scId: string, data: any)``

    Update charge point data.

- ``useWallet(wallet: Wallet).addTariffs(data: any)``

    Add CPO tariffs data.

- ``useWallet(wallet: Wallet).updateTariffs(data: any)``

    Update CPO tariffs data.

- ``useWallet(wallet: Wallet).batch().addLocations(...data: any[])``

    Batch add CPO charge point data.

----

``sc.token``

- ``getBalance(address: string)``

    Get balance of a particular address.

- ``useWallet(wallet: Wallet).deploy(name: string, symbol: string)``

    Deploy new MSP token with a particular name and symbol.

- ``useWallet(wallet: Wallet).setAccess(chargingContractAddress: string)``

    Grant a certain charging contract access to the MSP token.

- ``useWallet(wallet: Wallet).mint(address: string, value: number)``

    Mint tokens for a certain address.