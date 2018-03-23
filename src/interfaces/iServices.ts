import { ChargingService } from "../services/chargingService";
import { StationService } from "../services/stationService";
import { EvseService } from "../services/evseService";

export interface IServices {
    StationService: StationService;
    EvseService: EvseService;
    ChargingService: ChargingService;
}