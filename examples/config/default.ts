export default {
    // the contracts/environment to use
    stage: 'local',
    // the ethereum node to connect to
    ethProvider: 'http://localhost:8545',
    // the ipfs node to connect to
    ipfsProvider: {
        host: '127.0.0.1',
        port: '5001',
        protocol: 'http'
    },
    // the price per unit of gas to pay for
    gasPrice: 18000000000,
    // the interval for polling events in milliseconds
    pollingInterval: 1000,
    // an alternative MSP token contract address
    tokenAddress: ""
};
