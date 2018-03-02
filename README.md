## Share & Charge Lib/SDK

This is the Lib/SDK for interacting with the Share & Charge EV Network. It can be implemented in a browser or server environment, for example by the Share & Charge CPO Core Client or by an eMobility Service Provider's mobile app. 

Geth should be running in the background in dev mode with websocket support. A configuration is provided and can be invoked using:
```
npm run geth-dev
```

### Development && Deployment

1. Transpile your TypeScript code and package the lib as a tarball:
```
npm run deploy
```

*Note*: `tsc` may complain about overwriting input files. In such cases delete the `dist` directory and retry.

2. Specify as a dependency in another project's `package.json`:
```json
{
    "dependencies": {
        "sharecharge-lib": "path/to/sharecharge-lib.tgz"
    }
}
```

### Usage

By default, the sharecharge-lib will connect via websockets to the locally running Geth node. The Bridge class can be configured to use a different provider, howver, for instance a HTTP connection.

*JavaScript*
```js
const ShareAndCharge = require('sharecharge-lib').ShareAndCharge; 
const Contract = require('sharecharge-lib').Contract;

const contract = new Contract();
const sc = new ShareAndCharge(contract);
```

*TypeScript*
```ts
import { ShareAndCharge, Contract } from 'sharecharge-lib';

const contract = new Contract();
const sc = new ShareAndCharge(contract);
```


Events can be easily subscribed to and handled with a callback and filter, for instance:

```js
sc.start$.subscribe(request => {
    if (request.params.clientId === myClientId) {
        try {
            bridge.start();
            request.success();
        } catch (err) {
            request.failure();
        }
    }
});
```
