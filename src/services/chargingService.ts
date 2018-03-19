import { ConnectorService } from "./connectorService";
import { Connector } from "../models/connector";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";

export class ChargingService {

    constructor(private contract: Contract, private wallet: Wallet, private connectorService: ConnectorService) {

    }

    async requestStart(connector: Connector, secondsToRent: number): Promise<any>  {
        let result = await this.contract.send("requestStart", this.wallet, connector.id, secondsToRent);

        // start(connector).then(() => {}).error(() => {});
        return Promise.resolve();
    }

    confirmStart(connector: Connector) {

    }

    requestStop(connector: Connector) {

    }

    confirmStop(connector: Connector) {

    }
}