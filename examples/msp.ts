import { Connector } from './../src/models/connector';
import { ShareCharge } from '../src/shareCharge';
import { Wallet } from '../src/models/wallet';
import { loadContractDefs } from "../src/utils/defsLoader";
import { config } from "../src/utils/config";

const defs = loadContractDefs(config.stage);

async function findFreeConnector(sc: ShareCharge) {
    const stations = await sc.stations.getAll();
    console.log(stations.length);
    for (let station of stations) {
        if (await sc.connectors.anyFree(station)) {
            const connectors = await sc.connectors.getByStation(station);
            for (let connector of connectors) {
                if (connector.available) {
                    return connector.id;
                }
            }
        }
    }
    return "";
}

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

    const sc = new ShareCharge(config, defs, {});

    let selectedConnectorId = '';

    sc.on("StartConfirmed", async (result) => {
        if (result.connectorId === selectedConnectorId && result.controller.toLowerCase() === wallet.address) {
            console.log('Started', result.connectorId);
        }
    });

    sc.on("StopConfirmed", async (result) => {
        if (result.connectorId === selectedConnectorId && result.controller.toLowerCase() === wallet.address) {
            console.log('Stopped', result.connectorId);
            sc.stopListening(); // for this demo, app shutdown should call stop listening!
        }
    });

    const connectorId = await findFreeConnector(sc);
    if (connectorId != '') {
        sc.startListening();

        const connector = await sc.connectors.getById(connectorId);
        selectedConnectorId = connector.id;
        console.log(selectedConnectorId);

        await sc.charging.useWallet(wallet).requestStart(connector, 5);

        setTimeout(() => sc.charging.useWallet(wallet).requestStop(connector), 2000);

    } else {
        console.log('Unable to find station with free connectors!');
    }
}

main();