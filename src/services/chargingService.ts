import { Connector } from "../models/connector";
import { Contract } from "../models/contract";
import { Wallet } from "../models/wallet";
import { IContractProvider } from "./contractProvider";

export class ChargingService {

    private _resolved;

    constructor(private contractProvider: IContractProvider) {
    }

    async contract(): Promise<Contract> {
        this._resolved = this._resolved || await this.contractProvider.obtain('Charging');
        return this._resolved;
    }

    useWallet(wallet: Wallet) {
        return {
            requestStart: async (connector: Connector, secondsToRent: number) => {
                const contract = await this.contract();
                await contract.send("requestStart", wallet, connector.id, secondsToRent);
            },
            confirmStart: async (connector: Connector, controller: string) => {
                const contract = await this.contract();
                await contract.send("confirmStart", wallet, connector.id, controller);
            },
            requestStop: async (connector: Connector) => {
                const contract = await this.contract();
                await contract.send("requestStop", wallet, connector.id);
            },
            confirmStop: async (connector: Connector, controller: string) => {
                const contract = await this.contract();
                await contract.send("confirmStop", wallet, connector.id, controller);
            },
            error: async (connector: Connector, controller: string, errorCode: number) => {
                const contract = await this.contract();
                await contract.send("logError", wallet, connector.id, controller, errorCode);
            }
        };
    }
}
