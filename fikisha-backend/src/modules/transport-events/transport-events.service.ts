import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransportEventType } from '../../../generated/prisma/client';

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

  async findAll(schoolId: string, filters: FindAllFilters) {
    const where: any = { schoolId };

    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.busId) where.busId = filters.busId;
    if (filters.type) where.type = filters.type;
    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
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