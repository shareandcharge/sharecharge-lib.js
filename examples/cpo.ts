import { ShareCharge } from '../src/shareCharge';
import { Evse } from '../src/models/evse';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';

function concat(id) {
    return id.substr(0, 7) + '...' + id.substr(id.length - 5, id.length);
}

async function bulkCreate(wallet, sc: ShareCharge, total) {
    for (let i = 0; i < total; i++) {
        const station = new Station();
        await sc.stations.useWallet(wallet).create(station);
        console.log(`Created new station with id: ${concat(station.id)}`);

        const evse = new Evse();
        evse.stationId = station.id;
        evse.available = true;
        const evseId = evse.id;
        await sc.evses.useWallet(wallet).create(evse);
        console.log(`Created new evse with id: ${concat(evseId)}`);
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
    console.log(`Created new station with id: ${concat(station.id)}`);

    const evse = new Evse();
    evse.uid = "FR138E1ETG5578567YU8D";
    evse.stationId = station.id;
    evse.available = true;
    evse.basePrice = 1;
    const evseId = evse.id;
    await sc.evses.useWallet(wallet).create(evse);
    console.log(`Created new evse with id: ${concat(evseId)}`);

    sc.on("StartRequested", async (result) => {
        if (result.evseId == evseId) {
            console.log(`Start requested on ${concat(evseId)}`);

            // send start request to device... we assume success in this example!
            const success = true;
            const evse = await sc.evses.getById(evseId);
            if (success) {
                await sc.charging.useWallet(wallet).confirmStart(evse);
            } else {
                await sc.charging.useWallet(wallet).error(evse, 0);
            }
        }
    });

    sc.on("StopRequested", async (result) => {
        if (result.evseId == evseId) {
            console.log(`Stop requested on ${concat(evseId)}`);

            // send stop request to device... we assume success in this example!
            const success = true;
            const evse = await sc.evses.getById(evseId);
            if (success) {
                await sc.charging.useWallet(wallet).confirmStop(evse);
                await sc.charging.useWallet(wallet).chargeDetailRecord(evse, 100);
            } else {
                await sc.charging.useWallet(wallet).error(evse, 1);
            }
        }
    });

    sc.on("ChargeDetailRecord", async (result) => {
        if (result.evseId == evseId) {
            console.log(`Received ${result.finalPrice} tokens`);
        }
    });

    sc.startListening();
    console.log(`Listening for events`);
}

main();
