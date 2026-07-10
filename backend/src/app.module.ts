import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [AgentModule, TypeOrmModule.forRoot({
    type: "postgres",
    host: "aws-1-ap-northeast-2.pooler.supabase.com",
    port: 5432,
    username: "postgres.lkbvovjxzmjpzzojhnnc",
    password: "Nup-23-51177-1",
    database: "postgres",
    synchronize: true,
    autoLoadEntities: true,
    ssl:{
      rejectUnauthorized: false
    }
  })],
  controllers: [],
  providers: [],
})
export class AppModule {}
