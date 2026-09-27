import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SelectRouteDto } from './dto/select-route.dto';

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

  async getRoutes(schoolId: string) {
    return this.prisma.route.findMany({
      where: { schoolId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        bus: { select: { id: true, registrationNumber: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async selectRoute(user: JwtPayload, studentId: string, dto: SelectRouteDto) {
    const link = await this.prisma.parentStudent.findFirst({
      where: { parent: { userId: user.sub }, studentId },
    });

    if (!link) {
      throw new ForbiddenException('You are not linked to this student');
    }

    if (!dto.pickupStopId && !dto.dropoffStopId) {
      throw new BadRequestException('Select at least a pickup or dropoff stop');
    }

    const route = await this.prisma.route.findUnique({
      where: { id: dto.routeId },
      include: { stops: true },
    });

    if (!route || route.schoolId !== user.schoolId) {
      throw new NotFoundException(`Route with ID ${dto.routeId} not found`);
    }

    if (dto.pickupStopId && !route.stops.some((s) => s.id === dto.pickupStopId)) {
      throw new BadRequestException('Pickup stop does not belong to this route');
    }

    if (dto.dropoffStopId && !route.stops.some((s) => s.id === dto.dropoffStopId)) {
      throw new BadRequestException('Dropoff stop does not belong to this route');
    }

    return this.prisma.$transaction(async (tx) => {
      // A student rides one route per direction (morning/evening) — picking a
      // new route of the same direction replaces the old one instead of
      // stacking alongside it.
      const others = await tx.studentRoute.findMany({
        where: { studentId, active: true, routeId: { not: dto.routeId } },
        include: { route: { select: { direction: true } } },
      });
      const superseded = others.filter((o) => o.route.direction === route.direction);
      if (superseded.length > 0) {
        await tx.studentRoute.updateMany({
          where: { id: { in: superseded.map((o) => o.id) } },
          data: { active: false },
        });
      }

      return tx.studentRoute.upsert({
        where: { studentId_routeId: { studentId, routeId: dto.routeId } },
        update: {
          pickupStopId: dto.pickupStopId,
          dropoffStopId: dto.dropoffStopId,
          active: true,
        },
        create: {
          schoolId: user.schoolId,
          studentId,
          routeId: dto.routeId,
          pickupStopId: dto.pickupStopId,
          dropoffStopId: dto.dropoffStopId,
        },
        include: {
          route: {
            include: {
              stops: { orderBy: { sequence: 'asc' } },
              bus: { select: { id: true, registrationNumber: true } },
            },
          },
        },
      });
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}