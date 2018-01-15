import { Bridge } from './src/bridge';

/* REQUIREMENTS:
    - array of pole IDs
    - provider if rpc not available on ws://localhost:8546
    - user account
        - in keystore so available as eth.coinbase or eth.accounts[0]

*/

const poles = [
    '0x0100000000000000000000000000000000000000000000000000000000000000'
];

const bridge = new Bridge();

bridge.listen();

bridge.start$.subscribe(handleStartEvent);
bridge.stop$.subscribe(handleStopEvent);

function handleStartEvent(start) {
    const pole = start['_pole'];
    if (poles.includes(pole)) {
        console.log(`received start request on ${pole}`);
    }
}

function handleStopEvent(stop) {
    const pole = stop['_pole'];
    if (poles.includes(pole)) {
        console.log(`received stop request on ${pole}`);
    }
}

