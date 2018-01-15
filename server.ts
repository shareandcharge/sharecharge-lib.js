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

bridge.start$.subscribe(handleEvent);
bridge.stop$.subscribe(handleEvent);

async function handleEvent(ev): Promise<void> {
    const type = ev['_event'];
    const pole = ev['_pole'];
    if (poles.includes(pole)) {
        console.log(`received ${type} request on ${pole}`);
        try {
            type === 'start' ? start(ev) : stop(ev);
        } catch (err) {
            console.log(err.message);
            const receipt = await bridge.sendError(ev);
        }
    }
}

async function start(ev): Promise<void> {
    // call start on charging pole
    const receipt = await bridge.confirmStart(ev);
    console.log('start receipt:', receipt);
}

async function stop(ev): Promise<void> {
    // call stop on charging pole
    const receipt = await bridge.confirmStop(ev);
    console.log('stop receipt:', receipt);
}
