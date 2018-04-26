import { ShareCharge } from '../src/shareCharge';
import { Evse } from '../src/models/evse';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';
import { ToolKit } from '../src/utils/toolKit';

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
            const currency = ToolKit.hexToString(result.currency);
            console.log(`Price of charge: ${result.price / 100} ${currency}`);
            const balance = await sc.token.getBalance(wallet.keychain[0].address);
            console.log(`Remaining balance: ${balance / 100} ${currency}`);
            sc.stopListening();
        }
    });

    const evseUid = 'FR138E1ETG5578567YU8D';

    sc.startListening();

    const evse = await sc.evses.getByUid(evseUid);
    selectedevseId = evse.id;
    console.log('Found', selectedevseId);

    await sc.charging.useWallet(wallet).requestStart(evse, 0);

    setTimeout(() => sc.charging.useWallet(wallet).requestStop(evse), 2000);

}

main();