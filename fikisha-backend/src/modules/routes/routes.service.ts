import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { CreateStopDto } from './dto/create-stop.dto';
import { AssignStudentDto } from './dto/assign-student.dto';

export interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async geocode(query?: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 3) return [];

    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ke&limit=5&q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      headers: {
        // Nominatim's usage policy requires a User-Agent that identifies the
        // calling application — browsers won't let client JS set this header,
        // so the lookup is proxied through here instead of called from the
        // admin dashboard directly.
        'User-Agent': 'Fikisha-School-Transport/1.0 (+https://github.com/daily254-svg/Fikisha)',
      },
    });

    if (!res.ok) {
      throw new BadRequestException('Address search is temporarily unavailable');
    }

    const data = (await res.json()) as GeocodeResult[];
    return Array.isArray(data)
      ? data.map((r) => ({ display_name: r.display_name, lat: r.lat, lon: r.lon }))
      : [];
  }

  async create(schoolId: string, dto: CreateRouteDto) {
    const route = await this.prisma.$transaction(async (tx) => {
      const newRoute = await tx.route.create({
        data: {
          schoolId,
          name: dto.name,
          direction: dto.direction,
          busId: dto.busId,
        },
      });

      await tx.routeStop.createMany({
        data: dto.stops.map((stop) => ({
          schoolId,
          routeId: newRoute.id,
          ...stop,
        })),
      });

      return tx.route.findUnique({
        where: { id: newRoute.id },
        include: {
          stops: { orderBy: { sequence: 'asc' } },
        },
      });
    });

    return route;
  }

  async findAll(schoolId: string) {
    return this.prisma.route.findMany({
      where: { schoolId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        bus: true,
      },
    });
  }

  async findById(schoolId: string, routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        bus: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!route || route.schoolId !== schoolId) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    return route;
  }

  async update(schoolId: string, routeId: string, dto: UpdateRouteDto) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route || route.schoolId !== schoolId) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    return this.prisma.route.update({
      where: { id: routeId },
      data: dto,
    });
  }

  async addStop(schoolId: string, routeId: string, dto: CreateStopDto) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route || route.schoolId !== schoolId) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const existingStop = await this.prisma.routeStop.findFirst({
      where: { routeId, sequence: dto.sequence },
    });

    if (existingStop) {
      throw new ConflictException(
        `Stop with sequence ${dto.sequence} already exists on this route`,
      );
    }

    return this.prisma.routeStop.create({
      data: {
        schoolId,
        routeId,
        ...dto,
      },
    });
  }

  async removeStop(schoolId: string, routeId: string, stopId: string) {
    const stop = await this.prisma.routeStop.findUnique({
      where: { id: stopId },
    });

    if (!stop || stop.routeId !== routeId || stop.schoolId !== schoolId) {
      throw new NotFoundException(`Stop with ID ${stopId} not found on this route`);
    }

    const studentsUsingStop = await this.prisma.studentRoute.findFirst({
      where: {
        routeId,
        OR: [
          { pickupStopId: stopId },
          { dropoffStopId: stopId },
        ],
      },
    });

    if (studentsUsingStop) {
      throw new BadRequestException(
        'Cannot delete stop — students are assigned to it as pickup or dropoff',
      );
    }

    return this.prisma.routeStop.delete({
      where: { id: stopId },
    });
  }

  async assignStudent(schoolId: string, routeId: string, dto: AssignStudentDto) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
    });

    if (!route || route.schoolId !== schoolId) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    }

    if (dto.pickupStopId) {
      const pickupStop = await this.prisma.routeStop.findUnique({
        where: { id: dto.pickupStopId },
      });

      if (!pickupStop || pickupStop.routeId !== routeId) {
        throw new BadRequestException(
          `Pickup stop ${dto.pickupStopId} does not belong to this route`,
        );
      }
    }

    if (dto.dropoffStopId) {
      const dropoffStop = await this.prisma.routeStop.findUnique({
        where: { id: dto.dropoffStopId },
      });

      if (!dropoffStop || dropoffStop.routeId !== routeId) {
        throw new BadRequestException(
          `Dropoff stop ${dto.dropoffStopId} does not belong to this route`,
        );
      }
    }

    const existingAssignment = await this.prisma.studentRoute.findUnique({
      where: {
        studentId_routeId: {
          studentId: dto.studentId,
          routeId,
        },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Student is already assigned to this route');
    }

    return this.prisma.studentRoute.create({
      data: {
        schoolId,
        studentId: dto.studentId,
        routeId,
        pickupStopId: dto.pickupStopId,
        dropoffStopId: dto.dropoffStopId,
      },
    });
  }

  async unassignStudent(schoolId: string, routeId: string, studentId: string) {
    const assignment = await this.prisma.studentRoute.findUnique({
      where: {
        studentId_routeId: {
          studentId,
          routeId,
        },
      },
    });

    if (!assignment || assignment.schoolId !== schoolId) {
      throw new NotFoundException('Student is not assigned to this route');
    }

    return this.prisma.studentRoute.delete({
      where: {
        studentId_routeId: {
          studentId,
          routeId,
        },
      },
    });
  }
}