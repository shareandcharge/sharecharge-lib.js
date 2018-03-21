import { ChargingService } from "../services/chargingService";
import { StationService } from "../services/stationService";
import { ConnectorService } from "../services/connectorService";

export interface IServices {
    StationService: StationService;
    ConnectorService: ConnectorService;
    ChargingService: ChargingService;
}