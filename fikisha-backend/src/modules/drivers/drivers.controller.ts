import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('drivers')
@ApiBearerAuth('access-token')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DRIVER')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.driversService.getProfile(user.sub);
  }

  @Get('me/bus')
  getActiveBus(@CurrentUser() user: JwtPayload) {
    return this.driversService.getActiveBus(user.sub);
  }

  @Get('me/route/students')
  getRouteStudents(@CurrentUser() user: JwtPayload) {
    return this.driversService.getRouteStudents(user.sub);
  }
}