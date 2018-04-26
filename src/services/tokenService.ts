import { ContractProvider } from './contractProvider';
import { Wallet } from '../models/wallet';
import { Contract } from '../models/contract';
import { ConfigProvider } from './configProvider';

export class TokenService {

    public contract: Contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('MSPToken');
    }

    get address(): string {
        return this.contract.native.options.address;
    }

    async getName(): Promise<string> {
        return this.contract.call('name');
    }

    async getSymbol(): Promise<string> {
        return this.contract.call('symbol');
    }

    async getOwner(): Promise<string> {
        return this.contract.call('owner');
    }

    async getBalance(address: string): Promise<number> {
        const result = await this.contract.call("balanceOf", address);
        return parseInt(result);
    }

    useWallet(wallet: Wallet, keyIndex = 0) {
        return {
            deploy: async (name: string, symbol: string): Promise<string> => {
                const key = wallet.keychain[keyIndex];
                this.contract = await this.contractProvider.deploy('MSPToken', [name, symbol], key);
                return this.address;
            },
            setAccess: async (chargingContractAddress: string): Promise<any> => {
                const key = wallet.keychain[keyIndex];
                return this.contract.send('setAccess', [chargingContractAddress], key);
            },
            mint: async(address: string, value: number): Promise<any> => {
                const key = wallet.keychain[keyIndex];
                return this.contract.send('mint', [address, value], key);
            }
        };
    }
}
