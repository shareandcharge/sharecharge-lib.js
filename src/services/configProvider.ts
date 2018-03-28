import { injectable } from "inversify";
import "reflect-metadata";
import * as path from "path";

@injectable()
export class ConfigProvider {

    private config;

    constructor() {
        // horrible, need a better way to configure for different runtimes!
        if (typeof process === 'object') {
            const id = path.join(__dirname, `../../config/${process.env.sc_stage || "local"}.json`);
            this.config = require(id) || {};
        } else {
            this.config = {};
        }
    }

    get stage() {
        return this.config.stage || 'local';
    }

    get provider() {
        return this.config.provider || 'http://localhost:8545';
    }

    get gasPrice() {
        return this.config.gasPrice || 18000000000;
    }

    get pollingInterval() {
        return this.config.pollingInterval || 1000;
    }
}