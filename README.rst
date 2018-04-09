======================
Share & Charge Library
======================

This is the Library for interacting with the Share & Charge EV Network. It can be implemented in a browser or server environment, for example by the Share & Charge CPO Core Client or by an eMobility Service Provider's mobile app.

----

Setup
-----

**Blockchain**

An Ethereum client should be running in the background. A popular choice for development and testing is ``ganache-cli`` because of its instant sealing, however `geth <https://geth.ethereum.org/downloads/>`__ in development mode can also be used to provide conditions closer to a live environment (with Proof of Authority consensus and configurable block sealing times).

::

    npm install -g ganache-cli
    ganache-cli


..

    **sharecharge-contracts**

    The Share & Charge library depends on `sharecharge-contracts <https://github.com/motionwerkGmbH/sharecharge-contracts>`__. These are Ethereum smart contracts which enable the storing of Charing Poles on the Share & Charge EV network as well as interacting with them, for example, initiating charging sessions. This repository also provides a configuration for the aforementioned ``geth`` in development mode which can be run using ``npm run geth-dev``. The setup instructions for the smart contracts are as follows:

    ::

        git clone git@github.com:motionwerkGmbH/sharecharge-contracts.git
        cd sharecharge-contracts
        npm install
        truffle migrate


    This should output the definitions of the contracts to ``$HOME/.sharecharge/contract.defs.<ENV>.json``. This file is necessary to run the library against the correct version of the smart contracts.

..

**sharecharge-lib**

::

    git clone git@github.com:motionwerkGmbH/sharecharge-lib.git
    cd sharecharge-lib
    npm install
    npm run patch-contract
    npm test

Assuming the tests passed, the library is now ready to interact with the Share & Charge EV Network.

----

API description
---------------

**Wallet**

To store stations, evses and request/confirm charging sessions on the network, it is necessary to first create an Ethereum wallet. This wallet needs to be funded with Ether in order to pay the blockchain's transaction fees.

A wallet can be generated using either a new or known 12 word seed phrase. This seed phrase allows a user to regain access to their wallet if they lose it.

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

The ``ShareCharge`` module is the entry point to the network, allowing the addition of stations and evses, as well as the requesting and confirming of EV charging sessions.

*Construction*

The module requires a configuration object which lets the library know how to interact with the Ethereum client, like so:

.. code-block:: typescript

    const config = {
        // stage corresponding to desired contract definitions in $HOME/.sharecharge
        stage: 'local',
        // RPC endpoint of the Etheruem client running in the background
        provider: 'http://localhost:8545',
        // gas price of the network
        gasPrice: 18000000000
    }

*Example Usage - Creating Stations and Evses*

.. code-block:: typescript

    import { ShareCharge, Station, Evse } from 'sharecharge-lib';

    const sc = ShareCharge.getInstance();
    const wallet = new Wallet('seed');

    // initialise new station
    const station = new Station();

    // set parameters
    station.latitude = 52.6743;

    // initialise new evse
    const evse = new Evse();

    // set up evse
    evse.currency = 'EUR';
    evse.basePrice = 1.50;

    // create the evse on the network
    sc.evses.useWallet(wallet).create(evse);


*Example Usage - controlling EV charging sessions*

.. code-block:: typescript

    // find the evse on the network by its unique identifier
    sc.evses.getById(evseId).then(evse => {

        // request charge at the evse for 5 seconds
        sc.charging.useWallet(wallet).requestStart(evse, 5);

        // confirm to the network that the charge started
        sc.charging.useWallet(wallet).confirmStart(evse);

        // request stop at the evse
        sc.charging.useWallet(wallet).requestStop(evse);

        // confirm to the network that the charge stopped
        sc.charging.useWallet(wallet).confirmStop(evse);

        // notify network of error during charge session
        await sc.charging.useWallet(wallet).error(evse, 1 /* error code*/);

    });


*Example Usage - listening to events*

.. code-block:: typescript

    // start the event listener
    sc.startListening();

    // listen for StationCreated events
    sc.on('StationCreated', callback);

    // listen for StartRequested events
    sc.on('StartRequested', async (request) => {

        // obtain values from StartRequested Event
        const evseId = request.evseId;
        const secondsToRent = request.secondsToRent;
        const kwhToRent = request.kwhToRent;

        // filter by evseId
        if (myListOfEvses.includes(evseId)) {

            // send a request to the charging pole to start the charge sesssion here

            // get evse object from network to use in the following request
            const evse = await sc.evses.getById(evseId);

            // if start was successful, send a confirmation to the network
            await sc.charging.useWallet(wallet).confirmStart(evse);
        }

    });

Further usage examples can be found `here <https://github.com/motionwerkGmbH/sharecharge-lib/tree/domain/examples>`__.

----

The following events are subscribable:

- ``StationCreated``

    Broadcast when a new station is added to the network

    Values:

    - ``stationId``

        Newly created station's unique identifier

- ``StationUpdated``

    Broadcast when a station is updated

    Values:

    - ``stationId``

        Updated station's unique identifier

- ``EvseCreated``

    Broadcast when a new evse is added to the network

    Values:

    - ``evseId``

        Newly created evse's unique identifier

- ``EvseUpdated``

    Broadcast when a evse is updated

    Values:

    - ``evseId``

        Updated station's evse identifier

- ``StartRequested``

    Broadcast when a driver has successfully requested a new charging session

    Values:

    - ``evseId``

        The unique identifier of the evse which has been requested to start

    - ``controller``

        The Ethereum address of the driver who has requested the charge start

    - ``secondsToRent``

        The time to charge in seconds specified by the driver

    - ``kwhToRent``

        The number of kWh the driver has specified, should the EVSE be kWh based

- ``StartConfirmed``

    Broadcast when a CPO has successfully confirmed a charging session

    Values:

    - ``evseId``

        The unique identifier of the evse which is now charging

    - ``controller``

        The Ethereum address of the driver who is charging at the evse

- ``StopRequested``

    Broadcast when a driver has successfully requested the end of a charging session

    Values:

    - ``evseId``

        The unique identifier of the evse has been requested to stop

    - ``controller``

        The Ethereum address of the driver who has requested the stop

- ``StopConfirmed``

    Broadcast when a CPO has successfully confirmed the end of a charging session

    Values:

    - ``evseId``

        The unique identifier of the evse has stopped charging

    - ``controller``

        The Ethereum address of the driver whose charging session has ended


- ``ChargeDetailRecord``

    Broadcast when a CPO has succesfully confirmed the end of charging session
    
    Values:

    - ``startTime``

        In Unix timestamp format

    - ``stopTime``

        In Unix timestamp format

    - ``evseId``

        The blockchain specific id of the EVSE

    - ``controller``

        The Ethereum address of the driver whose charging session has ended

    - ``currency``

        ISO 4217 3-character currency code e.g. 'EUR'

    - ``price``

        The final price paid for the charge

    - ``totalEnergy``

        The energy consumed during the charge in Watts

- ``Error``

    Broadcast when a CPO has successfully notified the network that a charge failed

    Values:

    - ``evseId``

        The unique identifier of the evse which has failed

    - ``controller``

        The Ethereum address of the driver whose charging session has failed

    - ``errorCode``

        The type of failure that has occurred (e.g. failed to start or stop)

----

``sc.stations``

- ``getAll()``

    Returns an array containing all stations on the network

- ``getById(id: string)``

    Returns station object for given unique station identifier

- ``useWallet(wallet: Wallet).create(station: Station)``

    Creates station on network

- ``useWallet(wallet: Wallet).update(station: Station)``

    Updates station on network

----

``sc.evses``

- ``getById(id: string)``

    Returns evse object for given unique evse identifier

- ``getByStation(station: Station)``

    Returns array containing all evses for a given a station

- ``anyFree(station: Station)``

    Returns true if any evse on the station is available

- ``useWallet(wallet: Wallet).create(evse: Evse)``

    Creates evse on network

- ``useWallet(wallet: Wallet).update(evse: Evse)``

    Updates evse on network

----

``sc.charging``

- ``useWallet(wallet: Wallet).requestStart(evse: Evse, secondsToRent: number)``

    Request a start at a evse for a specified number of seconds

- ``useWallet(wallet: Wallet).confirmStart(evse: Evse)``

    Confirm a start on a evse.

- ``useWallet(wallet: Wallet).requestStop(evse: Evse)``

    Request a stop at a evse

- ``useWallet(wallet: Wallet).confirmStop(evse: Evse)``

    Confirm a stop on a evse.

- ``useWallet(wallet: Wallet).error(evse: Evse, errorCode: number)``

    Notify the network that an error occurred with the charging session for a given evse. Error codes are TBC.

----

**Station**

The Station module allows you to build station objects. They are configurable but also are defined with default values.

*Example Usage*:

.. code-block:: typescript

    import { Station } from 'sharecharge-lib';

    // initialse new station
    const station = new Station();

    // set a parameter
    station.latitude = 52.5;

    // get a parameter
    station.latitude
    // 52.5


Properties:

- ``id [string]``

    Unique identifier of station (generated by Share & Charge)

- ``owner [string]``

    Ethereum address of the station's owner (defined by wallet in use)

- ``latitude [number]``

    Floating point between -90 and 90

- ``longitude [number]``

    Floating point between -180 and 180

- ``openingHours [string]``

    Opening hours of station (TODO: OpeningHours format documentation)

----

**Evse**

The Evse module allows you to build evse objects. They are configurable but are also defined with default values.

*Example Usage*:

.. code-block:: typescript

    import { Evse } from 'sharecharge-lib'

    // initialise new evse
    const evse = new Evse();

    // set a parameter
    evse.currency = 'EUR';

    // get a parameter
    evse.currency
    // 'EUR'


Properties:

    private _tariffId: number = Tariff.FLAT;
    private _available: boolean = true;

- ``id [string]``

    Unique identifier of the evse (generated by Share & Charge)

- ``uid [string]``

    Unique identifier for CPO and MPS

- ``owner [string]``

    Ethereum address of the station's owner (defined by wallet in use)

- ``stationId [string]``

    The unique identifier of the station that the evse belongs to

- ``currency [string]``

    ISO 4217 compliant currency code

- ``basePrice [number]``

    Floating point number in highest denomination of currency (i.e. 1.50 EUR) denoting price per hour or per kwh.

- ``tariffId [number]``

    Enum value for tariff type (0 = kWh; 1 = flat; 2 = parking; 3 = time). [TODO: Tariff enum interface)

- ``available [boolean]``

    Set availability of evse

NPM Link for faster local development
--------------------------------------------------
Run the following command to create a symlink in the global folder for use later with other projects

``npm link``

Followed by this command to link sharecharge-contracts to the local global folder, this acts as a replacement for patch-contracts

``npm link sharecharge-contracts``

The above order of linking must be followed otherwise linking won't work!
