import { expect } from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { StationService } from '../src/services/stationService';
import { connector, registerParams } from './data';
import { Contract } from '../src/services/contract';
import { Wallet } from '../src/services/wallet';
import { Helper } from './helpers';
const Web3 = require('web3');

describe('StationService', function () {

    const provider = "http://localhost:8545";
    const config = require(process.env["HOME"] + '/.sharecharge/config.json');
    const contractConfig = config['StationStorage'];
    const gasPrice = 18000000000;

    let stationService, contract, wallet, coinbase, web3;

    before(async () => {
        web3 = new Web3(provider);

        const seed = 'filter march urge naive sauce distance under copy payment slow just cool';
        wallet = new Wallet(seed);

        coinbase = await web3.eth.getCoinbase();
        const receiver = wallet.address;
        const amount = web3.utils.toWei("0.001", "ether");

        web3.eth.sendTransaction({ from: coinbase, to: receiver, value: amount })
    });

    beforeEach(async () => {
        contract = new Contract(wallet, web3, {
            abi: contractConfig.abi,
            address: await Helper.deployContract(web3, contractConfig),
            gasPrice: config.gasPrice
        });
        stationService = new StationService(contract, wallet);
    });

    afterEach(async () => {
    });

    context('#getAllStations()', () => {
        it('return all stations', async function () {
            const id1 = await stationService.createStation({ latitude: 21.345, longitude: -0.92332, openingHours: "123455677" });
            const id2 = await stationService.createStation({ latitude: 12.345, longitude: 10.01231, openingHours: "123455677" });
            const id3 = await stationService.createStation({ latitude: -3.000, longitude: 20.91232, openingHours: "123455677" });
            const stations = await stationService.getAllStations();
            expect(stations.length).to.equal(3);
        });

    });

    context('#createStation()', () => {
        it('should create station', async () => {
            const owner = wallet.address;
            const id = await stationService.createStation({ latitude: 51.345, longitude: -0.92332, openingHours: "123455677" });
            const station = await stationService.getStation(id);
            expect(station.id).to.not.equal(undefined);
            expect(station.owner.toLowerCase()).to.equal(owner.toLowerCase());
            expect(station.latitude).to.equal(51.345);
            expect(station.longitude).to.equal(-0.92332);
            expect(station.openingHours).to.equal("123455677");
        });
    });
});

