import { ShareCharge } from '../src/shareCharge';
import { Evse } from '../src/models/evse';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';
import { ToolKit } from '../src/utils/toolKit';

function concat(id) {
    return id.substr(0, 7) + '...' + id.substr(id.length - 5, id.length);
}

async function main() {

    const mspWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');
    const driverWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cold');
    const mspKey = mspWallet.keychain[0];
    const driverKey = driverWallet.keychain[0];

    const sc: ShareCharge = ShareCharge.getInstance();

    // deploy MSP Token so that tokens can be minted for drivers
    const tokenAddress = await sc.token.useWallet(mspWallet).deploy("Generic MSP Token", "GMT");
    console.log('Created MSP Token');
    // allow charging contract to interact with new token contract
    await sc.token.useWallet(mspWallet).setAccess(sc.charging.address);
    // mint tokens for driver
    await sc.token.useWallet(mspWallet).mint(driverKey.address, 1000);
    console.log('Minted 1000 tokens for driver');

    let selectedevseId = '';

    sc.on("StartConfirmed", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === driverKey.address) {
            console.log('Started', concat(result.evseId));
        }
    });

    sc.on("StopConfirmed", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === driverKey.address) {
            console.log('Stopped', concat(result.evseId));
        }
    });

    sc.on("ChargeDetailRecord", async (result) => {
        if (result.evseId === selectedevseId && result.controller.toLowerCase() === driverKey.address) {
            const balance = await sc.token.getBalance(driverWallet.keychain[0].address);
            console.log(`Remaining balance: ${balance} Tokens`);
            sc.stopListening();
        }
    });

    const evseUid = 'FR138E1ETG5578567YU8D';

    sc.startListening();

    const evse = await sc.evses.getByUid(evseUid);
    selectedevseId = evse.id;
    console.log('Found', concat(selectedevseId));

    await sc.charging.useWallet(driverWallet).requestStart(evse, tokenAddress, 100);

    setTimeout(() => sc.charging.useWallet(driverWallet).requestStop(evse), 2000);

}

main();