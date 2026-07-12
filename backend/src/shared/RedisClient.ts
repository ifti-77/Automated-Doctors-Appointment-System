import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { DoctorDetailsForAgent } from './customeTypes';

@Injectable()
export class RedisClient {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setValueInRedis(key: string, value: string): Promise<boolean> {
    return (await this.redis.set(key, value, 'EX', 900, 'NX')) === 'OK';
  }

  async getValueFromRedis(key: string): Promise<object | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async checkRedisForKey(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async getDoctorDetailsFromRedis(
    doctorid: string,
  ): Promise<DoctorDetailsForAgent | null> {
    const key = `doctor:${doctorid}`;
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
}
