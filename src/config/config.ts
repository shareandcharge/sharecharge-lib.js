import contracts = require("../../config.json");

export const config = {
    version: '0.1.0',
    provider: 'http://localhost:8545',
    contracts: contracts,
    gasPrice: 18000000000
};
