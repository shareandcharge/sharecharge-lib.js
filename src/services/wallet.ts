import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as bip39 from 'bip39';

export class Wallet {

    private ks;
    private addressString;

    constructor() {}

    seed(): string {
        return bip39.generateMnemonic();
    }

    create(seedPhrase: string): string {
        const hdWallet = hdkey.fromMasterSeed(seedPhrase);
        const wallet = hdWallet.getWallet();
        this.addressString = wallet.getAddressString();
        return this.addressString;
    }

    get address(): string | undefined {
        return this.addressString;
    }

}