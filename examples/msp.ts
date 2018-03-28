import { ShareCharge } from '../src/shareCharge';
import { Evse } from '../src/models/evse';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';

async function findFreeEvse(sc: ShareCharge) {
    let evseid = "";
    const stations = await sc.stations.getAll();
    for (const station of stations) {
        if (await sc.evses.anyFree(station)) {
            const evses = await sc.evses.getByStation(station);
            for (const evse of evses) {
                if (evse.available) {
                    evseid = evse.id;
                }
            }
        }
    }
    return evseid;
}

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');
    const key = wallet.keychain[0];

    const sc: ShareCharge = ShareCharge.getInstance();

    let selectedevseId = '';

    sc.on("StartConfirmed", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === key.address) {
            console.log('Started', result.evseId);
        }
    });

    sc.on("StopConfirmed", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === key.address) {
            console.log('Stopped', result.evseId);
        }
    });

    sc.on("ChargeDetailRecord", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === key.address) {
            console.log('Received CDR');
            sc.stopListening();
        }
    });

    const evseId = await findFreeEvse(sc);
    if (evseId != '') {
        sc.startListening();

        const evse = await sc.evses.getById(evseId);
        selectedevseId = evse.id;
        console.log('Found', selectedevseId);

        await sc.charging.useWallet(wallet).requestStart(evse, 2000, 0);

        setTimeout(() => sc.charging.useWallet(wallet).requestStop(evse), 2000);

    } else {
        console.log('Unable to find station with free evses!');
    }
}

main();