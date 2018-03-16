export class Stub {

    sandbox;
    api;

    constructor(sandbox, api) {
        this.sandbox = sandbox;
        this.api = api;
    }

    resolves(method: string, response: any, ...args): void {
        this.sandbox.stub(this.api, method)
            .withArgs(...args)
            .resolves(response);
    }

}

export class Helper {

    static generateRandom() {
        return (Math.random() * 0xFFFFFFFFF << 0).toString(16);
    }

    static async deployContract(web3: any, config: { abi: any, bytecode: any }, gas: number = 2000000) {
        const coinbase = await await web3.eth.getCoinbase();
        const contract = new web3.eth.Contract(config.abi, null, {
            from: coinbase,
            data: config.bytecode,
            gas
        });
        const receipt = await contract.deploy().send({ from: coinbase });
        return receipt.options.address;
    }
}
