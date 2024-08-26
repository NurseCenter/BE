import { Controller, Get } from "@nestjs/common";
import { HealthCheckService } from "./health-check.service";


@Controller('health')
export class HealthCheckController {
    constructor(private readonly healthService: HealthCheckService) {}

    @Get()
    async checkHealth() {
        const healthStatus = await this.healthService.checkHealth();
        return {
            status: 'Healthy',
            ...healthStatus,
        }
    }
}