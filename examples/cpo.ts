import { ShareCharge } from '../src/shareCharge';
import { Connector } from '../src/models/connector';
import { Wallet } from '../src/models/wallet';
import { Station } from '../src/models/station';

const config = {
    stage: process.env.sc_stage || "local",
    provider: process.env.sc_provider || 'http://localhost:8545',
    gasPrice: 18000000000
};

const defs = require(process.env["HOME"] + `/.sharecharge/contract.defs.${config.stage}.json`);

async function bulkCreate(wallet, sc: ShareCharge, total) {
    for (let i = 0; i < total; i++) {
        const station = new Station();
        await sc.stations.useWallet(wallet).create(station);
        console.log(`Created new station with id: ${station.id}`);

        const connector = new Connector();
        connector.stationId = station.id;
        connector.available = true;
        const connectorId = connector.id;
        await sc.connectors.useWallet(wallet).create(connector);
        console.log(`Created new connector with id: ${connectorId}`);
    }
}

async function main() {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');

    const sc = new ShareCharge(config, defs, {});

    // how to do this fast?
    // await bulkCreate(wallet, sc, 250);

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