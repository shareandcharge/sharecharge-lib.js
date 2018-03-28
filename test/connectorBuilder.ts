import { Connector } from '../src/models/connector';
import { OpeningHours } from '../src';
import { ConnectorType } from '../src/models/connectorType';
import { PowerType } from '../src/models/powerType';

export class ConnectorBuilder {

    private evseId: string = "0x0000000000000000000000000000000000000001";
    private standard: number = ConnectorType.CHADEMO;
    private powerType: number = PowerType.AC_1_PHASE;
    private voltage: number = 240;
    private amperage: number = 30;

    withEvseId(val: string): ConnectorBuilder {
        this.evseId = val; return this;
    }

    withStandard(val: number): ConnectorBuilder {
        this.standard = val; return this;
    }

    withPowerType(val: number): ConnectorBuilder {
        this.powerType = val; return this;
    }

    withVoltage(val: number): ConnectorBuilder {
        this.voltage = val; return this;
    }

    withAmperage(val: number): ConnectorBuilder {
        this.amperage = val; return this;
    }

    build(): Connector {
        const connector = new Connector();
        connector.evseId = this.evseId;
        connector.standard = this.standard;
        connector.powerType = this.powerType;
        connector.voltage = this.voltage;
        connector.amperage = this.amperage;
        return connector;
    }
}
