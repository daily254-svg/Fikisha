import { Global, Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseService],
  exports: [NotificationsService, FirebaseService],
})
export class NotificationsModule {}