import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as bip39 from 'bip39';

export class Wallet {

    public ks;
    public address;

    constructor() {}

    seed(): string {
        return bip39.generateMnemonic();
    }

    create(seedPhrase: string): string {
        const hdWallet = hdkey.fromMasterSeed(seedPhrase);
        this.ks = hdWallet.getWallet();
        this.address = this.ks.getAddressString();
        return this.address;
    }

}