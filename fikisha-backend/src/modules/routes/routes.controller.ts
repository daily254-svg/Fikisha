import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { CreateStopDto } from './dto/create-stop.dto';
import { AssignStudentDto } from './dto/assign-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('routes')
@UseGuards(JwtAuthGuard, SchoolGuard, RolesGuard)
@Roles('SCHOOL_ADMIN')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRouteDto,
  ) {
    return this.routesService.create(user.schoolId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.routesService.findAll(user.schoolId);
  }

  @Get(':routeId')
  findById(
    @CurrentUser() user: JwtPayload,
    @Param('routeId') routeId: string,
  ) {
    return this.routesService.findById(user.schoolId, routeId);
  }

  @Patch(':routeId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('routeId') routeId: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routesService.update(user.schoolId, routeId, dto);
  }

  @Post(':routeId/stops')
  addStop(
    @CurrentUser() user: JwtPayload,
    @Param('routeId') routeId: string,
    @Body() dto: CreateStopDto,
  ) {
    return this.routesService.addStop(user.schoolId, routeId, dto);
  }

  @Delete(':routeId/stops/:stopId')
  removeStop(
    @CurrentUser() user: JwtPayload,
    @Param('routeId') routeId: string,
    @Param('stopId') stopId: string,
  ) {
    return this.routesService.removeStop(user.schoolId, routeId, stopId);
  }

  @Post(':routeId/students')
  assignStudent(
    @CurrentUser() user: JwtPayload,
    @Param('routeId') routeId: string,
    @Body() dto: AssignStudentDto,
  ) {
    return this.routesService.assignStudent(user.schoolId, routeId, dto);
  }

  @Delete(':routeId/students/:studentId')
  unassignStudent(
    @CurrentUser() user: JwtPayload,
    @Param('routeId') routeId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.routesService.unassignStudent(user.schoolId, routeId, studentId);
  }
}