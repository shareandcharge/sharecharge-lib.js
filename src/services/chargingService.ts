import { ConnectorService } from "./connectorService";
import { Connector } from "../models/connector";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { EventPollerService } from "./eventPollerService";
import { connect } from "tls";

export class ChargingService {

    constructor(private contract: Contract) { }

    useWallet(wallet: Wallet) {
        return {
            requestStart: async (connector: Connector, secondsToRent: number): Promise<any> => {
                this.contract.send("requestStart", wallet, connector.id, secondsToRent);
            },
            confirmStart: async (connector: Connector, controller: string) => {
                this.contract.send("confirmStart", wallet, connector.id, controller);
            },
            requestStop: async (connector: Connector) => {
                this.contract.send("requestStop", wallet, connector.id, wallet.address);
            },
            confirmStop: async (connector: Connector, controller: string) => {
                this.contract.send("confirmStop", wallet, connector.id, controller);
            },
            error: async (connector: Connector, controller: string, errorCode: number) => {
                this.contract.send("logError", wallet, connector.id, controller, errorCode);
            }
        }
    }
}