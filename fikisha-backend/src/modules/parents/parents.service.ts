import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class ParentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getProfile(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        user: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    return {
      ...parent,
      user: this.sanitizeUser(parent.user),
    };
  }

  async getStudents(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        students: {
          include: {
            student: {
              include: {
                routes: {
                  where: { active: true },
                  include: {
                    route: {
                      include: {
                        stops: { orderBy: { sequence: 'asc' } },
                        bus: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    return parent.students.map((ps) => ({
      relationship: ps.relationship,
      isPrimary: ps.isPrimary,
      student: ps.student,
    }));
  }

  async getStudentBusLocation(userId: string, studentId: string) {
    // Verify parent is linked to student
    const link = await this.prisma.parentStudent.findFirst({
      where: {
        parent: { userId },
        studentId,
      },
    });

    if (!link) {
      throw new ForbiddenException('You are not linked to this student');
    }

    // Get active route for student
    const studentRoute = await this.prisma.studentRoute.findFirst({
      where: { studentId, active: true },
    });

    if (!studentRoute) {
      return { bus: null, location: null, isLive: false, message: 'Student is not assigned to any active route' };
    }

    // Get bus from route
    const route = await this.prisma.route.findUnique({
      where: { id: studentRoute.routeId },
      include: { bus: true },
    });

    if (!route || !route.bus) {
      return { bus: null, location: null, isLive: false, message: 'No bus assigned to this route' };
    }

    // Get live location from Redis
    const cached = await this.redisService.get(`bus:${route.bus.id}:location`);

    if (cached) {
      return {
        bus: { id: route.bus.id, registrationNumber: route.bus.registrationNumber },
        location: JSON.parse(cached),
        isLive: true,
      };
    }

    // Fallback to DB
    const busLocation = await this.prisma.busLocation.findUnique({
      where: { busId: route.bus.id },
    });

    return {
      bus: { id: route.bus.id, registrationNumber: route.bus.registrationNumber },
      location: busLocation
        ? {
            lat: busLocation.latitude,
            lng: busLocation.longitude,
            speed: busLocation.speed,
            heading: busLocation.heading,
            updatedAt: busLocation.updatedAt,
          }
        : null,
      isLive: false,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}