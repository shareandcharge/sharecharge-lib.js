import { ShareCharge } from '../src/shareCharge';
import { Connector } from '../src/models/connector';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';
import { loadContractDefs } from "../src/utils/defsLoader";
import { config } from "../src/utils/config";

const defs = loadContractDefs(config.stage);

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');

    const sc = new ShareCharge(config, defs, {});

    const station = new Station();
    await sc.stations.useWallet(wallet).create(station);
    console.log(`Created new station with id: ${station.id}`);

    const connector = new Connector();
    connector.stationId = station.id;
    connector.available = true;
    const connectorId = connector.id;
    await sc.connectors.useWallet(wallet).create(connector);
    console.log(`Created new connector with id: ${connectorId}`);

    sc.on("StartRequested", async (result) => {
        if (result.connectorId == connectorId) {
            console.log(`Received start request for connector with id: ${connectorId}`);

            // send start request to device... we assume success in this example!
            const success = true;
            const connector = await sc.connectors.getById(connectorId);
            if (success) {
                sc.charging.useWallet(wallet).confirmStart(connector, result.controller);
            } else {
                sc.charging.useWallet(wallet).error(connector, result.controller, 0x7);
            }
        }
    });

    sc.on("StopRequested", async (result) => {
        if (result.connectorId == connectorId) {
            console.log(`Received stop request for connector with id: ${connectorId}`);

            // send stop request to device... we assume success in this example!
            const success = true;
            const connector = await sc.connectors.getById(connectorId);
            if (success) {
                sc.charging.useWallet(wallet).confirmStop(connector, result.controller);
            } else {
                sc.charging.useWallet(wallet).error(connector, result.controller, 0x3);
            }
        }
    });

    sc.startListening();
    console.log(`Listening for events`);
}

main();