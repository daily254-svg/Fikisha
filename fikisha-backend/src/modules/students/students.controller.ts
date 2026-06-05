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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { LinkParentDto } from './dto/link-parent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('students')
@UseGuards(JwtAuthGuard, SchoolGuard, RolesGuard)
@Roles('SCHOOL_ADMIN')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentsService.create(user.schoolId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.studentsService.findAll(user.schoolId);
  }

  @Get(':studentId')
  findById(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
  ) {
    return this.studentsService.findById(user.schoolId, studentId);
  }

  @Patch(':studentId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(user.schoolId, studentId, dto);
  }

  @Post(':studentId/parents')
  linkParent(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
    @Body() dto: LinkParentDto,
  ) {
    return this.studentsService.linkParent(user.schoolId, studentId, dto);
  }

  @Delete(':studentId/parents/:parentId')
  unlinkParent(
    @CurrentUser() user: JwtPayload,
    @Param('studentId') studentId: string,
    @Param('parentId') parentId: string,
  ) {
    return this.studentsService.unlinkParent(user.schoolId, studentId, parentId);
  }
}