import { ShareCharge } from '../src/shareCharge';
import { Evse } from '../src/models/evse';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';
import { ToolKit } from '../src/utils/toolKit';

function concat(id) {
    return id.substr(0, 7) + '...' + id.substr(id.length - 5, id.length);
}

async function main() {

    const cpoId = '0x73d008c9d78109c95c54b936c56b3cdc7ca8252e';
    const mspWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');
    const driverWallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cold');
    const mspKey = mspWallet.keychain[0];
    const driverKey = driverWallet.keychain[0];

    const sc: ShareCharge = ShareCharge.getInstance();

    // deploy MSP Token so that tokens can be minted for drivers
    const tokenAddress = await sc.token.useWallet(mspWallet).deploy("Generic MSP Token", "GMT");
    console.log(`Created MSP Token at ${tokenAddress}`);
    // allow charging contract to interact with new token contract
    await sc.token.useWallet(mspWallet).setAccess(sc.charging.address);
    // mint tokens for driver
    await sc.token.useWallet(mspWallet).mint(driverKey.address, 1000);
    console.log('Minted 1000 tokens for driver');

    const allLocations = await sc.store.getLocationsByCPO(cpoId);
    // console.log(allLocations.map(loc => loc.scId));
    const selected = allLocations[allLocations.length - 1];
    let selectedEvseId;

    try {
        selectedEvseId = selected.data.evses[0]['evse_id'];
    } catch (err) {
        console.log('Unable to find location. Make sure to run the CPO script first!');
        process.exit();
    }
    console.log(`Found location ${concat(selected.scId)}`);

    sc.on("StartConfirmed", async (result) => {
        if (result.scId === selected.scId && result.controller.toLowerCase() === driverKey.address) {
            console.log('Started', result.evseId);
        }
    });

    sc.on("StopConfirmed", async (result) => {
        if (result.scId === selected.scId && result.controller.toLowerCase() === driverKey.address) {
            console.log('Stopped', result.evseId);
        }
    });

    sc.on("ChargeDetailRecord", async (result) => {
        if (result.scId === selected.scId && result.controller.toLowerCase() === driverKey.address) {
            const balance = await sc.token.getBalance(driverWallet.keychain[0].address);
            console.log(`Remaining balance: ${balance} Tokens`);
            sc.stopListening();
        }
    });

    sc.startListening();
    console.log('Starting charge on EVSE', selectedEvseId);
    await sc.charging.useWallet(driverWallet).requestStart(selected.scId, selectedEvseId, tokenAddress, 100);
    setTimeout(() => sc.charging.useWallet(driverWallet).requestStop(selected.scId, selectedEvseId), 2000);

}

main();