import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>(
      'firebase.serviceAccountPath',
    );

    if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
      throw new Error(`Firebase service account not found at: ${serviceAccountPath}`);
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf-8'),
    );

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      this.logger.log('Firebase Admin SDK initialized');
    }
  }

  async sendToDevice(
    fcmToken: string,
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<boolean> {
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data ?? {},
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: { sound: 'default' },
          },
        },
      });
      return true;
    } catch (error: any) {
      this.logger.error(`FCM send failed: ${error.message}`);
      return false;
    }
  }

  async sendToMultiple(
    fcmTokens: string[],
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<void> {
    if (fcmTokens.length === 0) return;

    const messages = fcmTokens.map((token) => ({
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data ?? {},
      android: { priority: 'high' as const },
      apns: { payload: { aps: { sound: 'default' } } },
    }));

    try {
      const response = await admin.messaging().sendEach(messages);
      this.logger.log(
        `FCM batch: ${response.successCount} sent, ${response.failureCount} failed`,
      );
    } catch (error: any) {
      this.logger.error(`FCM batch send failed: ${error.message}`);
    }
  }
}