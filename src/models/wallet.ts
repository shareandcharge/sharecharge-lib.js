import * as bip39 from 'bip39';
import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as ethWallet from 'ethereumjs-wallet';
import { Key } from './key';

export class Wallet {

    public readonly path: string;
    public readonly keychain: Key[] = [];
    private readonly id: string;

    private static container;

    constructor(seedPhrase: string, subAccount: number = 0, numberOfKeys: number = 1) {
        // master / purpose' / chain_id' / account' / address_index
        // chain_id of ethereum main net is 60 (see https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
        this.path = `m/44'/60'/${subAccount}'`;

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

    get coinbase(): string {
        return this.keychain[0].address;
    }

    private getId(master: any): string {
        return master.getWallet().getAddressString();
    }

    addKey(seedPhrase: string): boolean {
        const master = hdkey.fromMasterSeed(seedPhrase);
        if (this.getId(master) === this.id) {
            const key = new Key(master.derivePath(this.path + '/' + this.keychain.length));
            this.keychain.push(key);
            return true;
        }
        return false;
    }

    addV3Key(keystore: any, password: string): void {
        const newKey = ethWallet.fromV3(keystore, password);
        const key = new Key(newKey);
        this.keychain.push(key);
        return;
    }

    removeKey(index = 0): void {
        this.keychain.splice(index, 1);
        return;
    }

    static generate(): { seed: string, wallet: Wallet } {
        const seed: string = bip39.generateMnemonic();
        return { seed, wallet: new Wallet(seed) };
    }

    static fromV3(keystore: any, password: string): Wallet {
        const wallet = Wallet.generate().wallet;
        wallet.removeKey();
        wallet.addV3Key(keystore, password);
        return wallet;
    }
}