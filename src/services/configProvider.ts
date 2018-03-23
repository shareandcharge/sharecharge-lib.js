import { Container, injectable, inject } from "inversify";
import "reflect-metadata";

@injectable()
export class ConfigProvider {

    private config;

    constructor() {
        this.config = require(`../../config/${process.env.sc_stage || "local"}.json`);
    }

    get stage() {
        return this.config.stage;
    }

    get provider() {
        return this.config.provider;
    }

    get gasPrice() {
        return this.config.gasPrice;
    }

}