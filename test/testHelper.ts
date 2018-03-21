import { ToolKit } from './../src/utils/toolKit';
import { Contract } from './../src/models/contract';
import { Wallet } from '../src/models/wallet';
import { IContractProvider } from '../src/services/contractProvider';

export class TestHelper {

    static generateRandom() {
        return (Math.random() * 0xFFFFFFFFF << 0).toString(16);
    }

    static async ensureFunds(web3: any, wallet: Wallet) {
        const destBalance = 5;
        const balance = web3.utils.fromWei(await web3.eth.getBalance(wallet.address), "ether");
        const coinbase = await web3.eth.getCoinbase();
        const receiver = wallet.address;
        const amount = web3.utils.toWei(destBalance.toString(), "ether");
        if (balance < destBalance) {
            await web3.eth.sendTransaction({ from: coinbase, to: receiver, value: amount });
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

    static getTestContractProvider(web3, config, defs, args?: any[]): IContractProvider {
        return <IContractProvider>{
            async obtain(key: string): Promise<Contract> {
                const contractDef = defs[key];
                const address = await TestHelper.deployContract(web3, contractDef, args);
                return new Contract(web3, {
                    abi: contractDef.abi,
                    address: address,
                    gasPrice: config.gasPrice
                });
            }
        };
    }
}
