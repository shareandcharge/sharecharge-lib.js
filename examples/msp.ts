import { ShareCharge } from '../src/shareCharge';
import { Wallet } from '../src/models/wallet';
import { loadContractDefs } from "../src/utils/defsLoader";
import { config } from "../src/utils/config";

const defs = loadContractDefs(config.stage);

async function findAvailableConnector() {
    return '';
}

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

    const sc = new ShareCharge(config, defs, {});

    let selectedConnectorId = '';

    sc.on("StartConfirmed", async (result) => {
        if (result.connectorId === selectedConnectorId && result.controller.toLowerCase() === wallet.address) {
            console.log('Started', result);
        }
    });

    sc.on("StopConfirmed", async (result) => {
        if (result.connectorId === selectedConnectorId && result.controller.toLowerCase() === wallet.address) {
            console.log('Stopped', result);
            sc.stopListening(); // for this demo, app shutdown should call stop listening!
        }
    });

    // const connectorId = await findAvailableConnector();
    const stations = await sc.stations.getAll();

    const connectors = await sc.connectors.getByStation(stations[0]);
    const connectorId = connectors[0].id;

    const connector = await sc.connectors.getById(connectorId);
    selectedConnectorId = connector.id;

    await sc.charging.useWallet(wallet).requestStart(connector, 5);
    sc.startListening();

    setTimeout(() => {
        sc.charging.useWallet(wallet).requestStop(connector);
    }, 5000);
}

main();