import { Module } from '@nestjs/common';
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
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { TrackingGateway } from './gateways/tracking/tracking.gateway';

@Module({
  imports: [AuthModule, SchoolsModule, UsersModule, ParentsModule, StudentsModule, DriversModule, BusesModule, RoutesModule, TrackingModule, NotificationsModule, PrismaModule, RedisModule],
  controllers: [AppController],
  providers: [AppService, TrackingGateway],
})
export class AppModule {}
