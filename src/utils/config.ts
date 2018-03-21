import { IConfig } from "../interfaces/iConfig";

export const config = <IConfig>{
    stage: process.env.sc_stage || "local",
    provider: process.env.sc_provider || 'http://localhost:8545',
    gasPrice: 18000000000
};

console.log("Running on stage:", config.stage);