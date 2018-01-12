import { Bridge } from './src/bridge';

const bridge = new Bridge();

bridge.start();

bridge.start$.subscribe(console.log);
bridge.stop$.subscribe(console.log);

bridge.mock();