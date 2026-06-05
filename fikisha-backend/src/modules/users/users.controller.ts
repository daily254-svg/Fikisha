import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('users')
@UseGuards(JwtAuthGuard, SchoolGuard, RolesGuard)
@Roles('SCHOOL_ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('drivers')
  createDriver(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateDriverDto,
  ) {
    return this.usersService.createDriver(user.schoolId, dto);
  }

  @Post('parents')
  createParent(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateParentDto,
  ) {
    return this.usersService.createParent(user.schoolId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.usersService.findAll(user.schoolId);
  }

  @Get(':userId')
  findById(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
  ) {
    return this.usersService.findById(user.schoolId, userId);
  }

  @Patch(':userId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.schoolId, userId, dto);
  }
}