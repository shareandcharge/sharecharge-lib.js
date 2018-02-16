## Share & Charge Lib/SDK

This is the Lib/SDK for interacting with the Share & Charge EV Network. It can be implemented in a browser or server environment, for example by the Share & Charge CPO Core Client or by an eMobility Service Provider's mobile app. 

Geth should be running in the background in dev mode with websocket support. A configuration is provided and can be invoked using:
```
npm run geth-dev
```

### Usage

By default, the OMOS Bridge will connect via websockets to the locally running Geth node. The Bridge class can be configured to use a different provider, howver, for instance a HTTP connection.

```js
const ShareAndCharge = require('share-and-charge'); 
const sc = new ShareAndCharge('http://localhost:8545');
```

Events can be easily subscribed to and handled with a callback and filter, for instance:

```js

bridge.start$.subscribe(request => {
    if (myClientId === request.params.clientId) {
        try {
            // try to start the charging session
            myBridge.start();
            request.success();
        } catch (err) {
            // inform the EV Network that an error occurred
            request.failure();
        }
    }
});
bridge.stop$.subscribe(request => {
    if (myClientId === request.params.clientId) {
        try {
            // try to stop the charging session
            myBridge.stop();
            request.success();
        } catch (err) {
            // inform the EV Network that an error occurred
            request.failure();
        }
    }
});
```