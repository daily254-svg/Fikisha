import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateIncidentDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });
    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    const assignment = await this.prisma.busAssignment.findFirst({
      where: { driverId: driver.id, isActive: true },
      include: { bus: true },
    });
    if (!assignment) {
      throw new NotFoundException('You are not currently assigned to a bus');
    }

    const incident = await this.prisma.incident.create({
      data: {
        schoolId: driver.schoolId,
        driverId: driver.id,
        busId: assignment.busId,
        type: dto.type,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    await this.notificationsService.sendIncidentNotification({
      schoolId: driver.schoolId,
      busId: assignment.busId,
      busRegistration: assignment.bus.registrationNumber,
      type: dto.type,
      description: dto.description,
    });

    return incident;
  }

  async findMine(userId: string, limit: number) {
    const driver = await this.prisma.driver.findUnique({ where: { userId } });
    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    return this.prisma.incident.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
