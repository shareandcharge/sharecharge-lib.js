import { TestContract } from './test/test-contract';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Bridge } from './src/bridge';
import { PoleContract } from './src/models/pole-contract';

/* REQUIREMENTS:
    - array of pole IDs
    - provider if rpc not available on ws://localhost:8546
    - user account
        - in keystore so available as eth.coinbase or eth.accounts[0]

*/

const poles = ['0x0100000000000000000000000000000000000000000000000000000000000000'];

// Need to use dependancy injection here!
const bridge = new Bridge(new PoleContract('pass'));

bridge.start$.subscribe(request => {
    const pole = request.params.pole;
    if (poles.includes(pole)) {
        console.log(`Received start request on ${pole}`);
        try {
            // charging pole started
            request.success().then(receipt =>
                console.log(`Start receipt: ${JSON.stringify(receipt)}`)
            );
        } catch (err) {
            // charging pole failed to start
            request.failure().then(receipt =>
                console.log(`${err.message} with receipt: ${JSON.stringify(receipt)}`)
            );
        }
    }
});

bridge.stop$.subscribe(request => {
    const pole = request.params.pole;
    if (poles.includes(pole)) {
        console.log(`Received stop request on ${pole}`);
        try {
            // charging pole stopped
            request.success().then(receipt =>
                console.log(`Stop receipt: ${JSON.stringify(receipt)}`)
            );
        } catch (err) {
            // charging pole failed to stop
            request.failure().then(receipt =>
                console.log(`${err.message} with receipt: ${JSON.stringify(receipt)}`)
            );
        }
    }
});
