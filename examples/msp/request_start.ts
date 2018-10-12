import { ShareCharge, Wallet } from '../../src/index';
import config from '../config/example';

const wallet = new Wallet('seed phrase for driver wallet');
const sc = ShareCharge.getInstance(config);

const start = async (scId: string, evseId: string, connectorId: string, tariffType: 'ENERGY' | 'FLAT' | 'TIME', chargeUnits: number, wallet: Wallet) => {

    // return a promise - we have to wait for the charge session to be accepted and confirmed by the CPO
    return new Promise(async (resolve, reject) => {

        // reverse lookup the CPO of the location
        const cpo = await sc.store.getOwnerOfLocation(scId);

        // use the CPO and the S&C location ID to get the location object
        const location = await sc.store.getLocationById(cpo, scId);

        // query which tariff belongs to the connector
        const tariffId = location.getTariffId(evseId, connectorId);

        // get the CPO's tariffs
        const tariffs = await sc.store.getAllTariffsByCPO(cpo);

        // select the correct tariff for the connector
        const tariff = tariffs[tariffId];

        // calculate the price given the driver's desired duration or consumption of the charging session
        const estimatedPrice = tariff.calculatePrice(tariffType, chargeUnits);

        // now build the start session request transaction
        const tx = sc.charging.useWallet(wallet).requestStart();
        tx.scId = scId;
        tx.evse = evseId;
        tx.connector = connectorId;
        tx.tariff = tariffType;
        tx.chargeUnits = chargeUnits;
        tx.estimatedPrice = estimatedPrice;

        // Before sending the transaction we can subscribe to "StartConfirmed" events. These are emitted once the CPO has confirmed the charge session start
        // Therefore, a driver will know that their session was successfully started only once this event is emitted
        sc.on('ConfirmStart', (startConfirmation) => {
            // check if the ConfirmStart event is related to the driver wishing to charge
            if (startConfirmation.controller.toLowerCase() === wallet.coinbase) {
                resolve();
            }
        });

        // Send the transaction to the network - note that this will only result in a successful REQUEST to charge, it then needs to be confirmed by the CPO
        await tx.send();
    });
};


const stop = async (scId: string, evseId: string, wallet: Wallet) => {
    return new Promise(async (resolve, reject) => {
        const tx = sc.charging.useWallet(wallet).requestStop();
        tx.scId = scId;
        tx.evse = evseId;

        // the same is true for stop - wait for the stop to be confirmed by the CPO
        sc.on('StopConfirmed', (stopConfirmation) => {
            if (stopConfirmation.controller.toLowerCase() === wallet.coinbase) {
                resolve();
            }
        });

        await tx.send();
    });
}

start('0x2d33312e3933373331382c3131352e373535373939', 'DE-1234', '1', 'FLAT', 3600, wallet)
    .then(() => {
        /* inform driver that charge has started */

        // driver wishes to stop after 10 minutes
        setTimeout(() => {
            stop('0x2d33312e3933373331382c3131352e373535373939', 'DE-1234', wallet)
                .then(() => {/* handle the stop success */});
        });
    });