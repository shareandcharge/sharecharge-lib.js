import { Connector } from "../models/connector";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";

export class ChargingService {

    constructor(public readonly contract: Contract) { }

    useWallet(wallet: Wallet) {
        return {
            requestStart: async (connector: Connector, secondsToRent: number) => {
                await this.contract.send("requestStart", wallet, connector.id, secondsToRent);
            },
            confirmStart: async (connector: Connector, controller: string) => {
                await this.contract.send("confirmStart", wallet, connector.id, controller);
            },
            requestStop: async (connector: Connector) => {
                await this.contract.send("requestStop", wallet, connector.id);
            },
            confirmStop: async (connector: Connector, controller: string) => {
                await this.contract.send("confirmStop", wallet, connector.id, controller);
            },
            error: async (connector: Connector, controller: string, errorCode: number) => {
                await this.contract.send("logError", wallet, connector.id, controller, errorCode);
            }
        };
    }
}
