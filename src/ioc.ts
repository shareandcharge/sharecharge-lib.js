import { Container, injectable, inject } from "inversify";
import "reflect-metadata";
import { ConfigProvider } from "./services/configProvider";
import { Symbols } from "./models/symbols";
import { ContractProvider } from "./services/contractProvider";
import { StationService, ConnectorService, ShareCharge } from ".";
import { ChargingService } from "./services/chargingService";

export class IoC {

    private static container;

    static resolve = async () => {
        if (!IoC.container) {
            const container = new Container();
            container.bind<ConfigProvider>(Symbols.ConfigProvider).to(ConfigProvider);
            container.bind<ContractProvider>(Symbols.ContractProvider).to(ContractProvider);
            container.bind<StationService>(Symbols.StationSerivce).to(StationService);
            container.bind<ConnectorService>(Symbols.ConnectorService).to(ConnectorService);
            container.bind<ChargingService>(Symbols.ChargingService).to(ChargingService);
            container.bind<ShareCharge>(Symbols.ShareCharge).to(ShareCharge);
            IoC.container = container;
        }
        return IoC.container.resolve(ShareCharge);
    }
}
