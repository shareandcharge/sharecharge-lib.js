import * as EthereumTx from 'ethereumjs-tx';

export class Key {

    public nonce;
    private ks: any;

    constructor(child: any) {
        this.ks = child.getWallet();
    }

    get address(): string {
        return this.ks.getAddressString();
    }

    sign(txObject: any): Buffer {
        const tx = new EthereumTx(txObject);
        tx.sign(this.ks.getPrivateKey());
        return tx.serialize();
    }

}