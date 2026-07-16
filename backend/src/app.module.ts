import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AgentModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_host'),
        port: configService.get('DB_port'),
        username: configService.get('DB_username'),
        password: configService.get('DB_password'),
        database: configService.get('DB_database'),
        synchronize: true,
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
