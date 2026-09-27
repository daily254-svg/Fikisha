import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SelectRouteDto } from './dto/select-route.dto';

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

  @Get('routes')
  getRoutes(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getRoutes(user.schoolId);
  }

  @Post('me/students/:studentId/route')
  selectRoute(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
    @Body() dto: SelectRouteDto,
  ) {
    return this.parentsService.selectRoute(user, studentId, dto);
  }
}