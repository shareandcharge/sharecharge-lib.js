export default {
    // the contracts/environment to use
    stage: 'test',
    // the ethereum node to connect to (related to the stage in use)
    ethProvider: 'ws://18.185.68.194:8546',
    // the ipfs node to connect to
    ipfsProvider: {
        host: '18.184.248.87',
        port: '5001',
        protocol: 'http'
    },
    // the price per unit of gas to pay for
    gasPrice: 2,
    // the interval for polling events in milliseconds
    pollingInterval: 1000,
    // an alternative MSP token contract address
    tokenAddress: "0x17D28914fB0394e9e1D1861cA40eC8bF31b28299"
};