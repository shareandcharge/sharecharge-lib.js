import { Evse } from './../src/models/evse';
import { ShareCharge } from '../src/shareCharge';
import { Wallet } from '../src/models/wallet';
import { config } from "../src/utils/config";
import { IoC } from '../src/ioc';

async function findFreeEvse(sc: ShareCharge) {
    const stations = await sc.stations.getAll();
    for (const station of stations) {
        if (await sc.evses.anyFree(station)) {
            const evses = await sc.evses.getByStation(station);
            for (const evse of evses) {
                if (evse.available) {
                    return evse.id;
                }
            }
        }
    }
    return "";
}

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');
    const key = wallet.keyAtIndex(0);

    const sc: ShareCharge = await IoC.resolve();
    sc.hookup();

    let selectedevseId = '';

    sc.on("StartConfirmed", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === key.address) {
            console.log('Started', result.evseId);
        }
    });

    sc.on("StopConfirmed", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === key.address) {
            console.log('Stopped', result.evseId);
            sc.stopListening(); // for this demo, app shutdown should call stop listening!
        }
    });

    const evseId = await findFreeEvse(sc);
    if (evseId != '') {
        sc.startListening();

        const evse = await sc.evses.getById(evseId);
        selectedevseId = evse.id;
        console.log(selectedevseId);

        await sc.charging.useWallet(wallet).requestStart(evse, 5);

        setTimeout(() => sc.charging.useWallet(wallet).requestStop(evse), 2000);

    } else {
        console.log('Unable to find station with free evses!');
    }
}

main();