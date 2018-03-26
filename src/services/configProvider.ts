import { Container, injectable, inject } from "inversify";
import "reflect-metadata";
import * as path from "path";

@injectable()
export class ConfigProvider {

    private config;

    constructor() {
        this.config = require(path.join(__dirname, `../../config/${process.env.sc_stage || "local"}.json`));
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