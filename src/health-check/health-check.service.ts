import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { DataSource } from "typeorm";

@Injectable()
export class HealthCheckService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
        @Inject(DataSource) private readonly dataSource: DataSource,
    ) {}

    // Redis와의 연결상태를 확인
    async checkRedis(): Promise<boolean> {
        try {
            await this.redisClient.ping();
            return true;
        } catch (error) {
            console.error("Redis health check failed ", error);
            return false;
        }
    }
    
    // TypeORM의 DataSource를 사용하여 MySQL과의 연결 상태를 확인
    async checkMySQL(): Promise<boolean> {
        try {
            await this.dataSource.query('SELECT 1');
            return true;
        } catch (error) {
            console.error("MySQL health check failed ", error);
            return false;
        }
    }

    async checkHealth(): Promise<{ redis: boolean; mysql: boolean }>{
        const redisHealthy = await this.checkRedis();
        const mysqlHealthy = await this.checkMySQL();
        return { redis: redisHealthy, mysql: mysqlHealthy }
    }
}