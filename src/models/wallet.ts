import * as EthereumTx from 'ethereumjs-tx';
import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as bip39 from 'bip39';

export class Wallet {

    private ks;

    constructor(seedPhrase: string) {
        const hdWallet = hdkey.fromMasterSeed(seedPhrase);
        this.ks = hdWallet.getWallet();
    }

    get address(): string {
        return this.ks.getAddressString();
    }

    sign(txObject): Buffer {
        const tx = new EthereumTx(txObject);
        tx.sign(this.ks._privKey);
        return tx.serialize();
    }

    static generate(): { seed: string, wallet: Wallet } {
        const seed: string = bip39.generateMnemonic();
        return { seed, wallet: new Wallet(seed) };
    }
}
