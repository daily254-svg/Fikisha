import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('parents')
@ApiBearerAuth('access-token')
@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getProfile(user.sub);
  }

  @Get('me/students')
  getStudents(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getStudents(user.sub);
  }

  @Get('me/students/:studentId/bus')
  getStudentBusLocation(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
  ) {
    return this.parentsService.getStudentBusLocation(user.sub, studentId);
  }
}