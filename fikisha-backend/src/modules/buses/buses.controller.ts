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
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('buses')
@UseGuards(JwtAuthGuard, SchoolGuard, RolesGuard)
@Roles('SCHOOL_ADMIN')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBusDto,
  ) {
    return this.busesService.create(user.schoolId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.busesService.findAll(user.schoolId);
  }

  @Get(':busId')
  findById(
    @CurrentUser() user: JwtPayload,
    @Param('busId') busId: string,
  ) {
    return this.busesService.findById(user.schoolId, busId);
  }

  @Patch(':busId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('busId') busId: string,
    @Body() dto: UpdateBusDto,
  ) {
    return this.busesService.update(user.schoolId, busId, dto);
  }

  @Post(':busId/assign-driver')
  assignDriver(
    @CurrentUser() user: JwtPayload,
    @Param('busId') busId: string,
    @Body() dto: AssignDriverDto,
  ) {
    return this.busesService.assignDriver(user.schoolId, busId, dto);
  }

  @Delete(':busId/unassign-driver')
  unassignDriver(
    @CurrentUser() user: JwtPayload,
    @Param('busId') busId: string,
  ) {
    return this.busesService.unassignDriver(user.schoolId, busId);
  }
}