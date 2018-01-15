## OMOS Bridge SDK

#### Setup

In order to interact with OMOS, a Geth node is required. 

- Once [installed](https://geth.ethereum.org/downloads/), the node should be initialised using the OMOS genesis block, available [here]()

```
geth init omos.json
```

- The owner of the charging pole can then be configured or imported

```
geth account new
```
or
```
geth account import path/to/ethereum/keyfile
```

- The Geth node should be started with websocket support

```
geth --ws --wsaddr 0.0.0.0 --wsorigins=0.0.0.0
```

- Connect to peers
```
$ geth attach
> admin.addPeer('enode://id@host:port')
```

### Usage

By default, the OMOS Bridge will connect via websockets to the locally running Geth node. The Bridge class can be configured to use a different provider, howver, for instance a HTTP connection.

```js
const Bridge = require('omos-bridge'); 
const bridge = new Bridge('http://localhost:8545');
```

Events can be easily subscribed to and handled with a callback and filter, for instance:

```js
bridge.listen();
bridge.start$.subscribe(startHandler);
bridge.stop$.subscribe(stopHandler);

const myPoles = ['evse_id_1', 'evse_id_2'];

function startHandler(start) {
    // start = StartRequest {
    //     _pole: 'evse_id_2' 
    //     _user: '0x12345..'
    // }

    if (myPoles.includes(start['_poleID'])) {
        // start charging session
    }
}
```