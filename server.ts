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

const bridge = new Bridge('pass');

bridge.listen();

bridge.start$.subscribe(request => {
    const pole = request.command.pole;
    if (poles.includes(pole)) {
        console.log(`Received start request on ${pole}`);
        try {
            // charging pole started
            console.log(`Start receipt: ${request.success()}`);
        } catch (err) {
            // charging pole failed to start
            console.log(`${err.message} with receipt: ${request.failure()}`);
        }
    }
});

bridge.stop$.subscribe(request => {
    const pole = request.command.pole;
    if (poles.includes(pole)) {
        console.log(`Received stop request on ${pole}`);
        try {
            // charging pole stopped
            console.log(`Stop receipt: ${request.success()}`);
        } catch (err) {
            // charging pole failed to stop
            console.log(`${err.message} with receipt: ${request.failure()}`);
        }
    }
});
