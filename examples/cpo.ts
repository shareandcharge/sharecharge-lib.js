import { ShareCharge } from '../src/shareCharge';
import { Evse } from '../src/models/evse';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';

async function bulkCreate(wallet, sc: ShareCharge, total) {
    for (let i = 0; i < total; i++) {
        const station = new Station();
        await sc.stations.useWallet(wallet).create(station);
        console.log(`Created new station with id: ${station.id}`);

        const evse = new Evse();
        evse.stationId = station.id;
        evse.available = true;
        const evseId = evse.id;
        await sc.evses.useWallet(wallet).create(evse);
        console.log(`Created new evse with id: ${evseId}`);
    }
}

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
    const key = wallet.keychain[0];
    const sc: ShareCharge = ShareCharge.getInstance();

    // how to do this fast?
    // await bulkCreate(wallet, sc, 250);
    const station = new Station();
    station.latitude = 52.5200;
    station.longitude = 13.4050;
    await sc.stations.useWallet(wallet).create(station);
    console.log(`Created new station with id: ${station.id}`);

    const evse = new Evse();
    evse.uid = "FR138E1ETG5578567YU8D";
    evse.stationId = station.id;
    evse.available = true;
    evse.basePrice = 1;
    const evseId = evse.id;
    await sc.evses.useWallet(wallet).create(evse);
    console.log(`Created new evse with id: ${evseId}`);

    let start, duration;

    sc.on("StartRequested", async (result) => {
        if (result.evseId == evseId) {
            console.log(`Received start request for evse with id: ${evseId}`);

            // send start request to device... we assume success in this example!
            const success = true;
            start = Date.now();
            duration = result.secondsToRent;
            const evse = await sc.evses.getById(evseId);
            if (success) {
                sc.charging.useWallet(wallet).confirmStart(evse);
            } else {
                sc.charging.useWallet(wallet).error(evse, 0);
            }
        }
    });

    sc.on("StopRequested", async (result) => {
        if (result.evseId == evseId) {
            console.log(`Received stop request for evse with id: ${evseId}`);

            // send stop request to device... we assume success in this example!
            const success = true;
            const evse = await sc.evses.getById(evseId);
            if (success) {
                sc.charging.useWallet(wallet).confirmStop(evse);
            } else {
                sc.charging.useWallet(wallet).error(evse, 1);
            }
        }
    });

    sc.on("ChargeDetailRecord", async (result) => {
        if (result.evseId == evseId) {
            console.log("Received CDR");
        }
    });

    sc.startListening();
    console.log(`Listening for events`);
}

main();
