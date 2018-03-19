import { ConnectorService } from "./connectorService";
import { Connector } from "../models/connector";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";

export class ChargingService {

    constructor(private contract: Contract, private wallet: Wallet, private connectorService: ConnectorService) {

    }

    requestStart(connector: Connector, secondsToRent: number)  {
        this.contract.send("requestStart", this.wallet, connector.id, secondsToRent);
    }

    confirmStart(connector: Connector) {

    }

    requestStop(connector: Connector) {

    }

    confirmStop(connector: Connector) {

    }
}