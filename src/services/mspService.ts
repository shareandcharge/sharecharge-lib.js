import { ContractProvider } from './contractProvider';
import { Wallet } from '../models/wallet';
import { Contract } from '../models/contract';
import { ConfigProvider } from './configProvider';

export class MSPService {

    /**
     * Access to generic contract functions (e.g. getLogs)
     */
    public contract: Contract;

    constructor(private contractProvider: ContractProvider) {
        this.contract = this.contractProvider.obtain('MSPToken');
    }

    /**
     * Get the configured eMobility Service Provider token contract address for the current stage
     */
    get address(): string {
        return this.contract.native.options.address;
    }

    /**
     * Set the token service to use a different eMobility Service Provider token contract
     */
    set address(newAddress: string) {
        this.contract = this.contractProvider.obtain('MSPToken', newAddress);
    }

    /**
     * Get the name of the MSP token
     */
    async getName(): Promise<string> {
        return this.contract.call('name');
    }

    /**
     * Get the shortened symbol of the MSP token
     */
    async getSymbol(): Promise<string> {
        return this.contract.call('symbol');
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
             * Deploy a new MSP token contract
             *
             * NOTE: high gas costs (estimated 2 - 2.5 million)
             *
             * NOTE: this will overwrite the current token contract used by the Share & Charge token service only for as long as the service is running. Save the returned token address for future use
             *
             * @param name the name to assign the new MSP token
             * @param symbol the shortened symbol to assign the new MSP token
             * @returns the address of the new MSP token on the network
             */
            deploy: async (name: string, symbol: string): Promise<string> => {
                this.contract = await this.contractProvider.deploy('MSPToken', [name, symbol], key);
                return this.address;
            },

            /**
             * Grant the Share & Charge charging contract access to specific, restricted functions on the MSP token (only callable by owner of the token). The address of the charging contract can be obtained via `ShareCharge.charging.address`. This is necessary to be able to request remote starts on EVSEs.
             * @param chargingContractAddress the Charging contract address to grant access to
             * @returns transaction object if successful
             */
            setAccess: async (chargingContractAddress: string): Promise<any> => {
                return this.contract.send('setAccess', [chargingContractAddress], key);
            },

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
             * Burn tokens from the wallet of the sender
             * @param value the amount of tokens to burn from the address
             * @returns transaction object if successful
             */
            burn: async(value: number): Promise<any> => {
                return this.contract.send('burn', [value], key);
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
