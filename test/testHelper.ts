import { Contract } from '../src/models/contract';
import { Key } from '../src/models/key';

export class TestHelper {

    static generateRandom() {
        return (Math.random() * 0xFFFFFFFFF << 0).toString(16);
    }

    static async ensureFunds(web3: any, key: Key) {
        const destBalance = 5;
        const balance = web3.utils.fromWei(await web3.eth.getBalance(key.address), "ether");
        const coinbase = await web3.eth.getCoinbase();
        const receiver = key.address;
        const amount = web3.utils.toWei(destBalance.toString(), "ether");
        if (balance < destBalance) {
            await web3.eth.sendTransaction({from: coinbase, to: receiver, value: amount});
        }
    }

    static async createContract(web3, config, def, args?: any[]) {
        const address = await TestHelper.deployContract(web3, def, args);
        return new Contract(web3, {
            abi: def.abi,
            address: address,
            gasPrice: config.gasPrice
        });
    }

    static async deployContract(web3: any, config: { abi: any, bytecode: any }, args: any[] = [], gas: number = 3000000) {
        const coinbase = await web3.eth.getCoinbase();
        const contract = new web3.eth.Contract(config.abi, {
            from: coinbase,
            data: config.bytecode,
            gas
        });
        const receipt = await contract.deploy({arguments: args}).send({from: coinbase});
        return receipt.options.address;
    }

}
