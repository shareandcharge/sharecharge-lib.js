import { Bridge } from './src/bridge';

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

