import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createDriver(schoolId: string, dto: CreateDriverDto) {
    await this.ensurePhoneUniqueInSchool(schoolId, dto.phone);

    const passwordHash = await bcrypt.hash(dto.phone, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          passwordHash,
          role: 'DRIVER',
        },
      });

      const driver = await tx.driver.create({
        data: {
          userId: user.id,
          schoolId,
          licenseNo: dto.licenseNo,
          employeeNo: dto.employeeNo,
        },
      });

      return { user, driver };
    });

    return {
      user: this.sanitizeUser(result.user),
      driver: result.driver,
    };
  }

  async createParent(schoolId: string, dto: CreateParentDto) {
    await this.ensurePhoneUniqueInSchool(schoolId, dto.phone);

    const passwordHash = await bcrypt.hash(dto.phone, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          passwordHash,
          role: 'PARENT',
        },
      });

      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          schoolId,
        },
      });

      return { user, parent };
    });

    return {
      user: this.sanitizeUser(result.user),
      parent: result.parent,
    };
  }

  async findAll(schoolId: string) {
    const users = await this.prisma.user.findMany({
      where: { schoolId },
      include: { driver: true, parent: true },
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async findById(schoolId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true, parent: true },
    });

    if (!user || user.schoolId !== schoolId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.sanitizeUser(user);
  }

  async update(schoolId: string, userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.schoolId !== schoolId) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return this.sanitizeUser(updated);
  }

  async updateFcmToken(userId: string, fcmToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });
  }

  async clearFcmToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: null },
    })
  }

  private async ensurePhoneUniqueInSchool(schoolId: string, phone: string) {
    const existing = await this.prisma.user.findUnique({
      where: {
        schoolId_phone: { schoolId, phone },
      },
    });

    if (existing) {
      throw new ConflictException(
        `User with phone ${phone} already exists in this school`,
      );
    }
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}