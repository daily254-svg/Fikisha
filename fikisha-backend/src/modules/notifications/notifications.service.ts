import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendBusApproachingNotification(data: {
    schoolId: string;
    busId: string;
    stopId: string;
    stopName: string;
    distanceMeters: number;
  }) {
    const studentRoutes = await this.prisma.studentRoute.findMany({
      where: {
        schoolId: data.schoolId,
        pickupStopId: data.stopId,
        active: true,
      },
      include: {
        student: {
          include: {
            parents: {
              include: {
                parent: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const fcmTokens: string[] = [];

    for (const sr of studentRoutes) {
      for (const ps of sr.student.parents) {
        const token = ps.parent.user.fcmToken;
        if (token) fcmTokens.push(token);
      }
    }

    if (fcmTokens.length === 0) {
      this.logger.log(
        `[FCM] No tokens found for stop ${data.stopName} — skipping`,
      );
      return;
    }

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      {
        title: 'Bus is arriving',
        body: `Your child's bus will arrive at ${data.stopName} in a few minutes`,
      },
      {
        type: 'BUS_APPROACHING',
        busId: data.busId,
        stopId: data.stopId,
        distanceMeters: String(Math.round(data.distanceMeters)),
      },
    );
  }

  async sendPickupNotification(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: {
          include: {
            parent: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!student) return;

    const fcmTokens = student.parents
      .map((ps) => ps.parent.user.fcmToken)
      .filter(Boolean) as string[];

    if (fcmTokens.length === 0) return;

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      {
        title: 'Child picked up ✅',
        body: `${student.firstName} ${student.lastName} has been picked up`,
      },
      { type: 'PICKED_UP', studentId },
    );
  }

  async sendDropoffNotification(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: {
          include: {
            parent: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!student) return;

    const fcmTokens = student.parents
      .map((ps) => ps.parent.user.fcmToken)
      .filter(Boolean) as string[];

    if (fcmTokens.length === 0) return;

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      {
        title: 'Child dropped off 🏠',
        body: `${student.firstName} ${student.lastName} has been dropped off`,
      },
      { type: 'DROPPED_OFF', studentId },
    );
  }
}