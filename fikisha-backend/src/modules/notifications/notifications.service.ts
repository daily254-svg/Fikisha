import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendBusApproachingNotification(data: {
    schoolId: string;
    busId: string;
    stopId: string;
    stopName: string;
    distanceMeters: number;
  }) {
    // TODO: replace with Firebase FCM
    this.logger.log(
      `[NOTIFY] Bus ${data.busId} approaching ${data.stopName} ` +
      `(${Math.round(data.distanceMeters)}m away) - School: ${data.schoolId}`,
    );
  }

  async sendPickupNotification(studentId: string) {
    this.logger.log(`[NOTIFY] Student ${studentId} picked up`);
  }

  async sendDropoffNotification(studentId: string) {
    this.logger.log(`[NOTIFY] Student ${studentId} dropped off`);
  }

  async sendDelayNotification(schoolId: string, busId: string, message: string) {
    this.logger.log(`[NOTIFY] Delay on Bus ${busId}: ${message}`);
  }
}