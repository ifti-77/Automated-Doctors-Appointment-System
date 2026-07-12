import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { ChatGroq } from '@langchain/groq';
import { ConfigService } from '@nestjs/config';
import { ReceptionistAgent } from 'src/AGENTS/reciptionist.agent';
import { RedisClient } from 'src/shared/RedisClient';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/entities/doctor.entity';
import { DoctorService } from 'src/doctor/doctor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor])],
  controllers: [AgentController],
  providers: [
    AgentService,
    {
      provide: 'GROQ_Model',
      useFactory: (configService: ConfigService) => {
        return new ChatGroq({
          model: 'openai/gpt-oss-120b',
          temperature: 0,
          apiKey: configService.get<string>('GROQ_API_KEY'),
        });
      },
      inject: [ConfigService],
    },
    ReceptionistAgent,
    RedisClient,
    DoctorService,
  ],
  exports: [],
})
export class AgentModule {}
