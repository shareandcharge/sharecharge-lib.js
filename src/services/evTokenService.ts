import { ContractProvider } from './contractProvider';
import { Contract } from '../models/contract';
import { Wallet } from '../models/wallet';

export class EVTokenService {

    public contract: Contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('EVToken');
    }

    get address(): string {
        return this.contract.native.options.address;
    }

    /**
     * Get the owner of the MSP token
     */
    async getOwner(): Promise<string> {
        return this.contract.call('owner');
    }

    /**
     * Get the number of tokens owned by a particular address
     * @param address the address to query
     */
    async getBalance(address: string): Promise<number> {
        const result = await this.contract.call("balanceOf", address);
        return parseInt(result);
    }

    /**
     * Specify a wallet to use for a transaction
     * @param wallet the Wallet object to use
     * @param keyIndex the index of the key containing the private key which will sign the transaction [default: 0]
     */
    useWallet(wallet: Wallet, keyIndex = 0) {
        const key = wallet.keychain[keyIndex];
        return {

            /**
             * Mint tokens for a specific address (only callable by owner of the token)
             * @param address the address to mint tokens for
             * @param value the amount of tokens to mint for the address
             * @returns transaction object if successful
             */
            mint: async(address: string, value: number): Promise<any> => {
                return this.contract.send('mint', [address, value], key);
            },

            /**
             * Transfer tokens from the wallet of the sender to the recipient address
             * @param address the recipient of the token transfer
             * @param value the amount of tokens to burn from the address
             * @returns transaction object if successful
             */
            transfer: async(address: string, value: number): Promise<any> => {
                return this.contract.send('transfer', [address, value], key);
            }

        };

    }
}
