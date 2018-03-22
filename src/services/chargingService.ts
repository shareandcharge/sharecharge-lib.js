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
                await contract.send("requestStart", [connector.id, secondsToRent], wallet);
            },
            confirmStart: async (connector: Connector, controller: string) => {
                const contract = await this.contract();
                await contract.send("confirmStart", [connector.id, controller], wallet);
            },
            requestStop: async (connector: Connector) => {
                const contract = await this.contract();
                await contract.send("requestStop", [connector.id], wallet);
            },
            confirmStop: async (connector: Connector, controller: string) => {
                const contract = await this.contract();
                await contract.send("confirmStop", [connector.id, controller], wallet);
            },
            error: async (connector: Connector, controller: string, errorCode: number) => {
                const contract = await this.contract();
                await contract.send("logError", [connector.id, controller, errorCode], wallet);
            }
        };
    }
}
