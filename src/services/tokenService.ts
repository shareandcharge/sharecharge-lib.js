import { IContractProvider } from './contractProvider';
import { Container, injectable, inject } from "inversify";
import { Symbols } from '../symbols';
import "reflect-metadata";
import { Wallet } from '../models/wallet';
import { Contract } from '../models/contract';

@injectable()
export class TokenService {

    public readonly contract: Contract;

    constructor(@inject(Symbols.ContractProvider) private contractProvider: IContractProvider) {
        this.contract = this.contractProvider.obtain('MSPToken');                
    }

    async balance(wallet: Wallet) {
        const result = await this.contract.call("balanceOf", wallet.keychain[0].address);
        return parseInt(result);
    }
}
