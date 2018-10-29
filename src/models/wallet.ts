import * as bip39 from 'bip39';
import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as ethWallet from 'ethereumjs-wallet';
import { Key } from './key';

export class Wallet {

    /**
     * the derivation path used to create new HD keys
     */
    public readonly path: string;

    /**
     * array containing keys in the wallet
     */
    public readonly keychain: Key[] = [];

    private readonly id: string;

    /**
     * Recover a hierarchical deterministic wallet from a seed phrase
     * @param seedPhrase a seed phrase that can be used to recover the wallet
     * @param subAccount used to generate a different set of keys from the same seed [default: 0]
     * @param numberOfKeys the amount of keys to populate the wallet with [default: 1]
     */
    constructor(seedPhrase: string, subAccount: number = 0, numberOfKeys: number = 1) {
        // master / purpose' / chain_id' / account' / address_index
        // chain_id of ethereum main net is 60 (see https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
        this.path = `m/44'/60'/0'/${subAccount}`;

        // the master from which keys are derived from
        const master = hdkey.fromMasterSeed(seedPhrase);
        // store master public key as id for later addKey check
        this.id = this.getId(master);

        // allows keychain to be regenerated if lost
        for (let index = 0; index < numberOfKeys; index++) {
            const key = new Key(master.derivePath(this.path + '/' + index));
            this.keychain.push(key);
        }
    }

    /**
     * Return primary address of wallet
     */
    get coinbase(): string {
        return this.keychain[0].address;
    }

    private getId(master: any): string {
        return master.getWallet().getAddressString();
    }

    /**
     * Add a new hierarchical deterministic key to the wallet
     * @param seedPhrase The seed phrase used to initially create the wallet
     * @returns boolean upon success
     */
    addKey(seedPhrase: string): boolean {
        const master = hdkey.fromMasterSeed(seedPhrase);
        if (this.getId(master) === this.id) {
            const key = new Key(master.derivePath(this.path + '/' + this.keychain.length));
            this.keychain.push(key);
            return true;
        }
        return false;
    }

    /**
     * Add a new key to the wallet from a geth/parity JSON v3 keystore
     * @param keystore the JSON v3 keystore object
     * @param password the password used to encrypt the keystore
     * @returns boolean upon success
     */
    addV3Key(keystore: any, password: string): boolean {
        const newKey = ethWallet.fromV3(keystore, password);
        const key = new Key(newKey);
        this.keychain.push(key);
        return true;
    }

    /**
     * Add new account to the wallet from a private key
     * @param privKey
     */
    addPrivateKey(privKey: string): boolean {
        if (privKey.startsWith('0x')) {
            privKey = privKey.slice(2, privKey.length);
        }
        const newKey = ethWallet.fromPrivateKey(Buffer.from(privKey, 'hex'));
        const key = new Key(newKey);
        this.keychain.push(key);
        return true;
    }

    /**
     * Remove a key at a certain index
     * @param index the index of the key to remove [default: 0]
     * @returns boolean upon success
     */
    removeKey(index = 0): boolean {
        this.keychain.splice(index, 1);
        return true;
    }

    /**
     * Generate a new hierarchical deterministic wallet from a random 12 word seed phrase
     * @returns the seed used to create the wallet, and the wallet object itself
     */
    static generate(): { seed: string, wallet: Wallet } {
        const seed: string = bip39.generateMnemonic();
        return { seed, wallet: new Wallet(seed) };
    }

    /**
     * Generate new wallet from private key
     * @param privKey
     */
    static fromPrivateKey(privKey: string): Wallet {
        const wallet = Wallet.generate().wallet;
        wallet.removeKey();
        wallet.addPrivateKey(privKey);
        return wallet;
    }

    /**
     * Create a new wallet using a a geth/parity JSON v3 keystore
     * @param keystore the JSON v3 keystore object
     * @param password the password used to encrypt the keystore
     * @returns a wallet object containing the decrypted key
     */
    static fromV3(keystore: any, password: string): Wallet {
        const wallet = Wallet.generate().wallet;
        wallet.removeKey();
        wallet.addV3Key(keystore, password);
        return wallet;
    }
}