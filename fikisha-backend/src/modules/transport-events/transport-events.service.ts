import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransportEventType } from '../../../generated/prisma/client';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

interface FindAllFilters {
  studentId?: string;
  busId?: string;
  type?: TransportEventType;
  date?: string;
  limit?: number;
}

@Injectable()
export class TransportEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: JwtPayload, filters: FindAllFilters) {
    const where: any = { schoolId: user.schoolId };

    if (filters.type) where.type = filters.type;
    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    if (user.role === 'DRIVER') {
      // Drivers only see events for the bus they're currently assigned to.
      const assignment = await this.prisma.busAssignment.findFirst({
        where: { driver: { userId: user.sub }, isActive: true },
        select: { busId: true },
      });
      if (!assignment) return [];
      where.busId = assignment.busId;
    } else if (user.role === 'PARENT') {
      // Parents only see events for their own linked children.
      const links = await this.prisma.parentStudent.findMany({
        where: { parent: { userId: user.sub } },
        select: { studentId: true },
      });
      const studentIds = links.map((l) => l.studentId);
      if (studentIds.length === 0) return [];

      if (filters.studentId) {
        if (!studentIds.includes(filters.studentId)) return [];
        where.studentId = filters.studentId;
      } else {
        where.studentId = { in: studentIds };
      }
    } else {
      // SCHOOL_ADMIN: unrestricted within their school.
      if (filters.studentId) where.studentId = filters.studentId;
      if (filters.busId) where.busId = filters.busId;
    }

    return this.prisma.transportEvent.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
          },
        },
        bus: {
          select: {
            id: true,
            registrationNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 100,
    });
  }
}
