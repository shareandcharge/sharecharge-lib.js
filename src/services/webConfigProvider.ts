import { IConfigProvider } from "./iConfigProvider";
import { injectable } from "inversify";
import "reflect-metadata";

@injectable()
export class WebConfigProvider implements IConfigProvider {

    private config;

    constructor() {
        this.config = {};
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