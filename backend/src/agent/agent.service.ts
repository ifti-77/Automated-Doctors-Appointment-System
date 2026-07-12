import { Injectable } from '@nestjs/common';
import { ReceptionistAgent } from '../AGENTS/reciptionist.agent';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { RedisClient } from 'src/shared/RedisClient';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from 'src/entities/doctor.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { DoctorDetailsForAgent } from 'src/shared/customeTypes';

@Injectable()
export class AgentService {
  constructor(
    private receptionistAgent: ReceptionistAgent,
    private readonly redis: RedisClient,
    private readonly doctorService: DoctorService,
  ) {}

  GetAgent(): string {
    return 'the agents are working';
  }

  async useAgent(content: string, doctorId: string): Promise<object> {
    if (!(await this.redis.checkRedisForKey(`doctor:${doctorId}`))) {
      const doctor = (await this.doctorService.GetDoctorById(
        doctorId,
      )) as DoctorDetailsForAgent;
      await this.redis.setValueInRedis(
        `doctor:${doctorId}`,
        JSON.stringify(doctor),
      )
    }

    return await this.receptionistAgent.RunAgent('user', content, doctorId);
  }
}
