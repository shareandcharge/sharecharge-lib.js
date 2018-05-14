import { ShareCharge } from '../src/shareCharge';
import { Wallet } from '../src/models/wallet';

const ocpiLocation = require('../test/data/ocpiLocation');

function concat(id) {
    return id.substr(0, 7) + '...' + id.substr(id.length - 5, id.length);
}

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
    const key = wallet.keychain[0];
    const sc: ShareCharge = ShareCharge.getInstance();

    const location = await sc.store.useWallet(wallet).addLocation(ocpiLocation);
    console.log(`Created new location with share&charge Id ${concat(location.scId)}`);

    sc.on("StartRequested", async (result) => {
        if (result.scId == location.scId) {
            console.log(`Start requested on ${concat(result.scId)}`);

            // send start request to device... we assume success in this example!
            const success = true;
            const evse = await sc.store.getLocationById(key.address, location.scId);
            if (success) {
                await sc.charging.useWallet(wallet).confirmStart(location.scId, result.evseId, '0x01');
            } else {
                await sc.charging.useWallet(wallet).error(location.scId, result.evseId, 0);
            }

        }
    });

    sc.on("StopRequested", async (result) => {
        if (result.scId == location.scId) {
            console.log(`Stop requested on ${concat(result.scId)}`);

            // send stop request to device... we assume success in this example!
            const success = true;
            if (success) {
                await sc.charging.useWallet(wallet).confirmStop(result.scId, result.evseId);
                await sc.charging.useWallet(wallet).chargeDetailRecord(result.scId, result.evseId, 100);
            } else {
                await sc.charging.useWallet(wallet).error(result.scId, result.evseId, 1);
            }
        }
    });

    sc.on("ChargeDetailRecord", async (result) => {
        if (result.scId == location.scId) {
            console.log(`Received ${result.finalPrice} tokens`);
        }
    });

    sc.startListening();
    console.log(`Listening for events`);
}

main();
