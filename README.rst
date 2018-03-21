Share & Charge Library
======================

This is the Library for interacting with the Share & Charge EV Network. It can be implemented in a browser or server environment, for example by the Share & Charge CPO Core Client or by an eMobility Service Provider's mobile app. 

Setup
-----

**Blockchain**

An Ethereum client should be running in the background. A popular choice for development and testing is ``ganache-cli`` because of its instant sealing, however `geth <https://geth.ethereum.org/downloads/>`__ in development mode can also be used to provide conditions closer to a live environment (with Proof of Authority consensus and configurable block sealing times).

::

    npm install -g ganache-cli
    ganache-cli


**sharecharge-contracts**

The Share & Charge library depends on `sharecharge-contracts <https://github.com/motionwerkGmbH/sharecharge-contracts>`__. These are Ethereum smart contracts which enable the storing of Charing Poles on the Share & Charge network as well as interacting with them, for example, initiating charging sessions. This repository also provides a configuration for the aforementioned ``geth`` in development mode which can be run using ``npm run geth-dev``. The setup instructions for the smart contracts are as follows:

::

    git clone git@github.com:motionwerkGmbH/sharecharge-contracts.git
    cd sharecharge-contracts
    npm install
    truffle migrate


This should output the definitions of the contracts to ``$HOME/.sharecharge/contract.defs.local.json``. This file is necessary to run the library against the correct version of the smart contracts.

**sharecharge-lib**

::

    git clone git@github.com:motionwerkGmbH/sharecharge-lib.git
    cd sharecharge-lib
    npm install
    npm test

Assuming the tests passed, the library is now ready to interact with the Share & Charge EV Network. 


API description
---------------

**Wallet**

To store stations, connectors and request/confirm charging sessions on the network, it is necessary to first create an Ethereum wallet. This wallet needs to be funded with Ether in order to pay the blockchain's transaction fees.

A wallet can be generated using either a new or known 12 word seed phrase. This seed phrase allows a user to regain access to their wallet if they lose it.

*TypeScript Usage*:

.. code-block:: typescript

    import { Wallet } from 'sharecharge-lib';

    // generate new seed and keypair
    const wallet = Wallet.generate();
    
    { seed: 'make side cargo palm tongue switch blur tuna reform soup shove music',
      keys:
      Wallet {
        ks:
        Wallet {
            _privKey: <Buffer db 48 77 b6 1c e4 27 a1 2e f7 eb 6c 83 f8 52 35 70 82 32 0c fb ad 24 e3 e3 60 25 10 c2 bf ad 39>,
            _pubKey: undefined } } }

    wallet.keys.address;
    // 0x0aee9216f1db9b779a44ff16ec79d46d6feaf03c


    // alternatively, generate from seed
    const wallet = new Wallet('make side cargo palm tongue switch blur tuna reform soup shove music');

    wallet.address;
    // 0x0aee9216f1db9b779a44ff16ec79d46d6feaf03c


**ShareCharge**

The ``ShareCharge`` module is the entry point to the network, allowing the addition of stations and connectors, as well as the requesting and confirming of EV charging sessions.

*Construction*

The module requires a configuration object which lets the library know how to interact with the Ethereum client, like so:

.. code-block:: typescript

    const config = {
        // stage corresponding to desired contract definitions in $HOME/.sharecharge
        stage: 'local',
        provider: 'http://localhost:8545',
        gasPrice: 18000000000
    }

*Usage - Creating Stations and Connectors*

.. code-block:: typescript

    import { ShareCharge, Station, Connector } from 'sharecharge-lib';

    const sc = new ShareCharge(config);
    const wallet = new Wallet('seed');

    
    // initialise new station
    const station = new Station();
    
    // set parameters
    station.latitude = 52.6743;
    
    // create the station on the network
    sc.stations.useWallet(wallet).create(station);

    // initialise new connector
    const connector = new Connector();
    
    // link the connector to the station
    connector.stationId = station.id;

    // create the connector on the network
    sc.connectors.useWallet(wallet).create(connector);


*Example Usage - controlling EV charging sessions*

.. code-block:: typescript

    // find the connector on the network by its unique identifier
    sc.connectors.getById(connectorId).then(connector => {
    
        // request charge at the connector for 5 seconds
        sc.charging.useWallet(wallet).requestStart(connector, 5);

        // confirm to the network that the charge started
        sc.charging.useWallet(wallet).confirmStart(connector, addressOfDriver);
        
        // request stop at the connector
        sc.charging.useWallet(wallet).requestStop(connector);
        
        // confirm to the network that the charge stopped
        sc.charging.useWallet(wallet).confirmStop(connector, addressOfDriver);
    
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
        const connectorId = request.connectorId;
        const driver = request.controller;
        const secondsToRent = request.secondsToRent;

        // filter by connectorId
        if (myListOfConnectors.includes(connectorId)) {

            // send a request to the charging pole to start the charge sesssion here

            // get connector object from network to use in the following request
            const connector = await sc.connectors.getById(connectorId);

            // if start was successful, send a confirmation to the network
            await sc.charging.useWallet(wallet).confirmStart(connector, controller);
        }
    
    });

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

- ``ConnectorCreated``
    
  Broadcast when a new connector is added to the network
    
  Values:
    
  - ``connectorId``
    
    Newly created connector's unique identifier

- ``ConnectorUpdated``
  
  Broadcast when a connector is updated

  Values:
    
  - ``connectorId``
    
    Updated station's connector identifier

- ``StartRequested``
    
  Broadcast when a driver has successfully requested a new charging session

  Values:
    
  - ``connectorId``
    
    The unique identifier of the connector which has been requested to start
    
  - ``controller``
    
    The Ethereum address of the driver who has requested the charge start

  - ``secondsToRent``
    
    The time to charge in seconds specified by the driver 

- ``StartConfirmed``
    
  Broadcast when a CPO has successfully confirmed a charging session

  Values:
    
  - ``connectorId``
    
    The unique identifier of the connector which is now charging
    
  - ``controller``
    
    The Ethereum address of the driver who is charging at the connector

- ``StopRequested``
    
  Broadcast when a driver has successfully requested the end of a charging session

  Values:

  - ``connectorId``
        
    The unique identifier of the connector has been requested to stop
    
  - ``controller``
    
    The Ethereum address of the driver who has requested the stop
    

- ``StopConfirmed``
    
  Broadcast when a CPO has successfully confirmed the end of a charging session

  Values:

  - ``connectorId``
    
    The unique identifier of the connector has stopped charging
    
  - ``controller``
    
    The Ethereum address of the driver whose charging session has ended

- ``Error``
    
  Broadcast when a CPO has successfully notified the network that a charge failed

  Values:

  - ``connectorId``
    
    The unique identifier of the connector which has failed

  - ``controller``
    
    The Ethereum address of the driver whose charging session has failed

  - ``errorCode``
    
    The type of failure that has occurred (e.g. failed to start or stop)

``sc.stations``

- ``getAll()``
    
  Returns an array containing all stations on the network

- ``getById(id: string)``

  Returns station object for given unique station identifier

- ``isPersisted(station: Station)``

  Returns true if station exists on network

- ``useWallet(wallet: Wallet).create(station: Station)``

  Creates station on network

- ``useWallet(wallet: Wallet).update(station: Station)``

  Updates station on network


``sc.connectors``

- ``getById(id: string)``

  Returns connector object for given unique connector identifier

- ``getByStation(station: Station)``

  Returns array containing all connectors for a given a station

- ``anyFree(station: Station)``

  Returns true if any connector on the station is available

- ``isPersisted(connector: Connector)``

  Returns true if connector exists on network

- ``useWallet(wallet: Wallet).create(connector: Connector)``

  Creates connector on network

- ``useWallet(wallet: Wallet).update(connector: Connector)``

  Updates connector on network


``sc.charging``

- ``useWallet(wallet: Wallet).requestStart(connector: Connector, secondsToRent: number)``

  Request a start at a connector for a specified number of seconds

- ``useWallet(wallet: Wallet).confirmStart(connector: Connector, controller: string)``

  Confirm a start on a connector for a certain driver. The controller (driver) will be broadcast in the StartRequested event.

- ``useWallet(wallet: Wallet).requestStop(connector: Connector)``

  Request a stop at a connector

- ``useWallet(wallet: Wallet).confirmStop(connector: Connector, controller, string)``

  Confirm a stop on a connector for a certain driver. The controller (driver) will be broadcast in the StopRequested event.

- ``useWallet(wallet: Wallet).error(connector: Connector, controller: string, errorCode: number)``

  Notify the network that an error occurred with the charging session for a given connector and controller. Error codes are TBC.  

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


**Connector**

The Connector module allows you to build connector objects. They are configurable but are also defined with default values.

*Example Usage*:

.. code-block:: typescript

    import { Connector } from 'sharecharge-lib'

    // initialise new connector
    const connector = new Connector();

    // set a parameter
    connector.stationId = '0x01';

    // get a parameter
    connector.stationId
    // '0x01'


Properties:

- ``id [string]``

  Unique identifier of the connector (generated by Share & Charge)

- ``owner [string]``

  Ethereum address of the station's owner (defined by wallet in use)

- ``stationId [string]``

  The unique identifier of the station that the connector belongs to

- ``plugMask [number]``

  A mask of plug types supported by the connector (TODO: plugMask format documentation)

- ``available [boolean]``

  Set availability of connector
