import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as bip39 from 'bip39';
import { Key } from './key';

export class Wallet {

    public readonly path: string;
    private readonly master: any;
    private readonly keys: number;

    constructor(seedPhrase: string, subAccount: number = 0, numberOfKeys: number = 10) {
        // m / purpose' / chain_id' / account' / address_index
        // chain_id of ethereum main net is 60 (see https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
        this.path = "m/44'/60'/" + subAccount;
        this.keys = numberOfKeys - 1;
        const hdwallet = hdkey.fromMasterSeed(seedPhrase);
        const master = hdwallet.derivePath(this.path);
        this.master = master.privateExtendedKey();
    }

    get key(): any {
        const index = Math.round(Math.random() * this.keys);
        const master = hdkey.fromExtendedKey(this.master);
        const child = master.derivePath(this.path + "/" + index);
        return new Key(child);
    }

    keyAtIndex(index: number): any {
        const master = hdkey.fromExtendedKey(this.master);
        const child = master.derivePath(this.path + "/" + index);
        return new Key(child);
    }

    get keychain(): string[] {
        const children: string[] = [];
        const master = hdkey.fromExtendedKey(this.master);
        for (let i = 0; i <= this.keys; i++) {
            const child = master.derivePath(this.path + "/" + i);
            children.push(child.getWallet().getAddressString());
        }
        return children;
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
