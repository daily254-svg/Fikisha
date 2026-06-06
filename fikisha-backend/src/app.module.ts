import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { UsersModule } from './modules/users/users.module';
import { ParentsModule } from './modules/parents/parents.module';
import { StudentsModule } from './modules/students/students.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { BusesModule } from './modules/buses/buses.module';
import { RoutesModule } from './modules/routes/routes.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TransportEventsModule } from './modules/transport-events/transport-events.module';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

import configuration from './config/configuration';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),

    AuthModule,
    SchoolsModule,
    UsersModule,
    ParentsModule,
    StudentsModule,
    DriversModule,
    BusesModule,
    RoutesModule,
    TrackingModule,
    NotificationsModule,
    TransportEventsModule,
    PrismaModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}