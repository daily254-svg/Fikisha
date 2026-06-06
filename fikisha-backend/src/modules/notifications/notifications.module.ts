import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [NotificationsService, FirebaseService],
  exports: [NotificationsService, FirebaseService],
})
export class NotificationsModule {}