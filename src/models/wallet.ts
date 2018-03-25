import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as bip39 from 'bip39';
import { Key } from './key';

export class Wallet {

    public readonly path: string;
    public readonly keychain: Key[] = [];

    constructor(seedPhrase: string, subAccount: number = 0, numberOfKeys: number = 1) {
        // master / purpose' / chain_id' / account' / address_index
        // chain_id of ethereum main net is 60 (see https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
        this.path = "m/44'/60'/" + subAccount;

        // the master from which keys are derived from
        const master = hdkey.fromMasterSeed(seedPhrase);

        // allows keychain to be regenerated if lost
        for (let index = 0; index < numberOfKeys; index++) {
            const key = new Key(master.derivePath(this.path + '/' + index));
            this.keychain.push(key);
        }
    }

    addKey(seedPhrase: string): void {
        const master = hdkey.fromMasterSeed(seedPhrase);
        const key = new Key(master.derivePath(this.path + '/' + this.keychain.length));
        this.keychain.push(key);
    }

    get balance(): number {
        // TODO: return total 'master' balance
        return 0;
    }

    balanceOf(key: Key): number {
        // TODO: get single address balance
        return 0;
    }

    transferToMaster(): void {
        // TODO: transfer all funds back to master
    }

    transferToKey(key: Key): void {
        // TODO: transfer funds from master to key
    }

    static generate(): { seed: string, wallet: Wallet } {
        const seed: string = bip39.generateMnemonic();
        return { seed, wallet: new Wallet(seed) };
    }
}