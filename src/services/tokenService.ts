import { ContractProvider } from './contractProvider';
import { Wallet } from '../models/wallet';
import { Contract } from '../models/contract';

export class TokenService {

    public readonly contract: Contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('MSPToken');
    }

    async balance(wallet: Wallet) {
        const result = await this.contract.call("balanceOf", wallet.keychain[0].address);
        return parseInt(result);
    }
}
