import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        schoolId_phone: {
          schoolId: dto.schoolId,
          phone: dto.phone,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      phone: user.phone,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateUser(phone: string, schoolId: string, password: string): Promise<JwtPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        schoolId_phone: {
          schoolId,
          phone,
        },
      },
    });

    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;

    return {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      phone: user.phone,
    };
  }
}