import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { NotificationType } from '../../../generated/prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  private async persistForUsers(
    schoolId: string,
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType,
  ) {
    if (userIds.length === 0) return;
    await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        schoolId,
        userId,
        title,
        message,
        type,
      })),
    });
  }

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
    const userIds: string[] = [];

    for (const sr of studentRoutes) {
      for (const ps of sr.student.parents) {
        userIds.push(ps.parent.user.id);
        const token = ps.parent.user.fcmToken;
        if (token) fcmTokens.push(token);
      }
    }

    const title = 'Bus is arriving';
    const message = `Your child's bus will arrive at ${data.stopName} in a few minutes`;

    await this.persistForUsers(
      data.schoolId,
      userIds,
      title,
      message,
      'BUS_APPROACHING',
    );

    if (fcmTokens.length === 0) {
      this.logger.log(
        `[FCM] No tokens found for stop ${data.stopName} — skipping`,
      );
      return;
    }

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      { title, body: message },
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

    const title = 'Child picked up ✅';
    const message = `${student.firstName} ${student.lastName} has been picked up`;
    const userIds = student.parents.map((ps) => ps.parent.user.id);

    await this.persistForUsers(student.schoolId, userIds, title, message, 'PICKED_UP');

    const fcmTokens = student.parents
      .map((ps) => ps.parent.user.fcmToken)
      .filter(Boolean) as string[];

    if (fcmTokens.length === 0) return;

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      { title, body: message },
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

    const title = 'Child dropped off 🏠';
    const message = `${student.firstName} ${student.lastName} has been dropped off`;
    const userIds = student.parents.map((ps) => ps.parent.user.id);

    await this.persistForUsers(student.schoolId, userIds, title, message, 'DROPPED_OFF');

    const fcmTokens = student.parents
      .map((ps) => ps.parent.user.fcmToken)
      .filter(Boolean) as string[];

    if (fcmTokens.length === 0) return;

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      { title, body: message },
      { type: 'DROPPED_OFF', studentId },
    );
  }

  async sendAbsentNotification(studentId: string) {
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

    const title = 'Marked absent';
    const message = `${student.firstName} ${student.lastName} was marked absent from today's route`;
    const userIds = student.parents.map((ps) => ps.parent.user.id);

    await this.persistForUsers(student.schoolId, userIds, title, message, 'ABSENT');

    const fcmTokens = student.parents
      .map((ps) => ps.parent.user.fcmToken)
      .filter(Boolean) as string[];

    if (fcmTokens.length === 0) return;

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      { title, body: message },
      { type: 'ABSENT', studentId },
    );
  }

  /** Notifies parents of every student on the bus's active routes, plus the school's admins. */
  async sendIncidentNotification(data: {
    schoolId: string;
    busId: string;
    busRegistration: string;
    type: string;
    description: string;
  }) {
    const [routes, admins] = await Promise.all([
      this.prisma.route.findMany({
        where: { busId: data.busId, schoolId: data.schoolId },
        include: {
          students: {
            where: { active: true },
            include: {
              student: {
                include: {
                  parents: { include: { parent: { include: { user: true } } } },
                },
              },
            },
          },
        },
      }),
      this.prisma.user.findMany({
        where: { schoolId: data.schoolId, role: 'SCHOOL_ADMIN' },
      }),
    ]);

    const userMap = new Map<string, { id: string; fcmToken: string | null }>();
    for (const route of routes) {
      for (const sr of route.students) {
        for (const ps of sr.student.parents) {
          userMap.set(ps.parent.user.id, {
            id: ps.parent.user.id,
            fcmToken: ps.parent.user.fcmToken,
          });
        }
      }
    }
    for (const admin of admins) {
      userMap.set(admin.id, { id: admin.id, fcmToken: admin.fcmToken });
    }

    const notificationType: NotificationType =
      data.type === 'EMERGENCY' ? 'EMERGENCY' : 'DELAY';
    const title =
      data.type === 'EMERGENCY' ? '🚨 Emergency reported' : 'Delay reported';
    const message = `Bus ${data.busRegistration}: ${data.description}`;

    const userIds = Array.from(userMap.keys());
    await this.persistForUsers(data.schoolId, userIds, title, message, notificationType);

    const fcmTokens = Array.from(userMap.values())
      .map((u) => u.fcmToken)
      .filter(Boolean) as string[];

    if (fcmTokens.length === 0) return;

    await this.firebaseService.sendToMultiple(
      fcmTokens,
      { title, body: message },
      { type: notificationType, busId: data.busId },
    );
  }
}
