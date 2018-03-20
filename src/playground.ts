import { Station } from './models/station';
import { Wallet } from './models/wallet';
import { ShareCharge } from './shareCharge';
import { Connector } from './models/connector';

export class PlayGround {

    private sc = new ShareCharge(null, null);
    private wallet = new Wallet("seeds");

    async station() {
        const station = new Station();

        const singleStation = await this.sc.stations.getById("");

        const allStations = await this.sc.stations.getAll();

        const isPersisted = await this.sc.stations.isPersisted(station);

        await this.sc.stations.useWallet(this.wallet).create(station);

        await this.sc.stations.useWallet(this.wallet).update(station);

        this.sc.on("StationCreated", (id) => {
            // Add station to locally cached database
        });

        this.sc.on("StationUpdated", (id) => {
            // Update details of locally cached station
        });
    }

    async connector() {
        const connector = new Connector();
        const station = new Station();

        const singleConnector = await this.sc.connectors.getById("");

        const allStationConnectors = await this.sc.connectors.getByStation(station);

        const isPersisted = await this.sc.connectors.isPersisted(connector);

        await this.sc.connectors.useWallet(this.wallet).create(connector);

        await this.sc.connectors.useWallet(this.wallet).update(connector);

        this.sc.on("ConnectorCreated", (id) => {
            // Add connector to locally cached database
        });

        this.sc.on("ConnectorUpdated", (id) => {
            // Update details of locally cached connector
        });
    }

    async mspCharging() {
        const connector = new Connector();

        // we receive all StartConfirmed events, therefore we
        // must filter the events by the connector id used during request start
        this.sc.on("StartConfirmed", async (connectorId, controller) => { });

        // we receive all StopConfirmed events, therefore we
        // must filter the events by the connector id used during request start
        this.sc.on("StopConfirmed", async (connectorId, controller) => { });

        // we receive all Error events, therefore we
        // must filter the events by the connector id used during request start
        this.sc.on("Error", async (connectorId, controller, errorCode) => { });

        this.sc.charging.useWallet(this.wallet).requestStart(connector, 1440);

        this.sc.charging.useWallet(this.wallet).requestStop(connector);
    }

    async cpoCharging() {

        // we receive all StartRequested events, therefore we
        // must filter the events by connector id
        this.sc.on("StartRequested", async (connectorId, controller, secondsToRent) => {
            const connector = await this.sc.connectors.getById(connectorId);

            // call cpo backend using bridge
            const success = true;

            if (success) {
                this.sc.charging.useWallet(this.wallet).confirmStart(connector, controller);
            } else {
                const errorCode = 8;
                this.sc.charging.useWallet(this.wallet).error(connector, controller, errorCode);
            }
        });

        // we receive all StopRequested events, therefore we
        // must filter the events by connector id
        this.sc.on("StopRequested", async (connectorId, controller) => {
            const connector = await this.sc.connectors.getById(connectorId);

            // call cpo backend using bridge
            const success = true;

            if (success) {
                this.sc.charging.useWallet(this.wallet).confirmStop(connector, controller);
            } else {
                const errorCode = 32;
                this.sc.charging.useWallet(this.wallet).error(connector, controller, errorCode);
            }
        });

    }
}