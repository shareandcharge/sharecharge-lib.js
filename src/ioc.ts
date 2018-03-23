import { Container, injectable, inject } from "inversify";
import "reflect-metadata";
import { ConfigProvider } from "./services/configProvider";
import { Symbols } from "./models/symbols";
import { ContractProvider, IContractProvider } from "./services/contractProvider";
import { StationService, EvseService, ShareCharge } from ".";
import { ChargingService } from "./services/chargingService";

export class IoC {

    private static container;

    static resolve = async () => {
        IoC.initialize();
        return IoC.container.resolve(ShareCharge);
    }

    static getContainer(): Container {
        IoC.initialize();
        return IoC.container;
    }

    private static initialize() {
        if (!IoC.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider).inSingletonScope();
            container.bind<IContractProvider>(Symbols.ContractProvider).to(ContractProvider).inSingletonScope();
            container.bind<StationService>(Symbols.StationSerivce).to(StationService).inSingletonScope();
            container.bind<EvseService>(Symbols.EvseService).to(EvseService).inSingletonScope();
            container.bind<ChargingService>(Symbols.ChargingService).to(ChargingService).inSingletonScope();
            container.bind<ShareCharge>(Symbols.ShareCharge).to(ShareCharge).inSingletonScope();
            IoC.container = container;
        }
    }
}
