import * as lightwallet from 'eth-lightwallet';

export class Wallet {

    private keystore;
    private ks;

    constructor() {
        this.keystore = lightwallet.keystore;
    }

    create(password = ''): Promise<string> {
        return new Promise((resolve, reject) => {

            const hdPathString = "m/44'/60'/0'/0";
            const seedPhrase = this.keystore.generateRandomSeed();

            this.keystore.createVault({ password, hdPathString, seedPhrase }, (err, ks) => {

                if (err) {
                    reject(Error(err));
                }

                this.ks = ks;

                this.ks.keyFromPassword(password, (err, pwDerivedKey) => {

                    if (err) {
                        reject(Error(err));
                    }

                    this.ks.generateNewAddress(pwDerivedKey);

                    resolve(this.ks.getAddresses());
                });

            });

        });
    }

}