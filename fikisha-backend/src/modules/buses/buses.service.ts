import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';

@Injectable()
export class BusesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateBusDto) {
    await this.ensureRegistrationUnique(schoolId, dto.registrationNumber);

    return this.prisma.bus.create({
      data: {
        schoolId,
        ...dto,
      },
    });
  }

  async findAll(schoolId: string) {
    const buses = await this.prisma.bus.findMany({
      where: { schoolId },
      include: {
        assignments: {
          where: { isActive: true },
          take: 1,
          include: {
            driver: {
              include: { user: true },
            },
          },
        },
        location: true,
      },
    });

    return buses.map((bus) => this.sanitizeBus(bus));
  }

  async findById(schoolId: string, busId: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
      include: {
        assignments: {
          where: { isActive: true },
          take: 1,
          include: {
            driver: {
              include: { user: true },
            },
          },
        },
        location: true,
      },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    return this.sanitizeBus(bus);
  }

  async update(schoolId: string, busId: string, dto: UpdateBusDto) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    return this.prisma.bus.update({
      where: { id: busId },
      data: dto,
    });
  }

  async assignDriver(schoolId: string, busId: string, dto: AssignDriverDto) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
    });

    if (!driver || driver.schoolId !== schoolId) {
      throw new NotFoundException(`Driver with ID ${dto.driverId} not found`);
    }

    // Deactivate any current active assignment
    await this.prisma.busAssignment.updateMany({
      where: { busId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    // Create new assignment
    return this.prisma.busAssignment.create({
      data: {
        schoolId,
        busId,
        driverId: dto.driverId,
        isActive: true,
      },
      include: {
        driver: {
          include: { user: true },
        },
      },
    });
  }

  async unassignDriver(schoolId: string, busId: string) {
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus || bus.schoolId !== schoolId) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    await this.prisma.busAssignment.updateMany({
      where: { busId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    return { message: 'Driver unassigned' };
  }

  private async ensureRegistrationUnique(schoolId: string, registrationNumber: string) {
    const existing = await this.prisma.bus.findUnique({
      where: {
        schoolId_registrationNumber: {
          schoolId,
          registrationNumber,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Bus with registration number ${registrationNumber} already exists in this school`,
      );
    }
  }

  private sanitizeBus(bus: any) {
    const sanitized = { ...bus, liveLocation: null };

    if (sanitized.assignments) {
      sanitized.assignments = sanitized.assignments.map((assignment: any) => ({
        ...assignment,
        driver: assignment.driver
          ? {
              ...assignment.driver,
              user: assignment.driver.user
                ? (({ passwordHash, ...u }) => u)(assignment.driver.user)
                : null,
            }
          : null,
      }));
    }

    return sanitized;
  }
}