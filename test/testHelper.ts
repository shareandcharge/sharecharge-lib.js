import { Wallet } from '../src/models/wallet';

export class TestHelper {

    static generateRandom() {
        return (Math.random() * 0xFFFFFFFFF << 0).toString(16);
    }

    static async ensureFunds(web3: any, wallet: Wallet) {
        const balance = await web3.eth.getBalance(wallet.address);
        const coinbase = await web3.eth.getCoinbase();
        const receiver = wallet.address;
        const amount = web3.utils.toWei("10", "ether");
        if (balance < 1000000) {
            web3.eth.sendTransaction({ from: coinbase, to: receiver, value: amount });
        }
    }

    static async deployContract(web3: any, config: { abi: any, bytecode: any }, args: any[] = [], gas: number = 2000000) {
        const coinbase = await web3.eth.getCoinbase();
        const contract = new web3.eth.Contract(config.abi, {
            from: coinbase,
            data: config.bytecode,
            gas
        });
        const receipt = await contract.deploy({ arguments: args }).send({ from: coinbase });
        return receipt.options.address;
    }

}
