import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { SchoolScoped } from '../../common/decorators/school-scoped.decorator';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get(':schoolId')
  @UseGuards(JwtAuthGuard, SchoolGuard)
  @SchoolScoped()
  findById(@Param('schoolId') schoolId: string) {
    return this.schoolsService.findById(schoolId);
  }

  @Patch(':schoolId')
  @UseGuards(JwtAuthGuard, SchoolGuard)
  @SchoolScoped()
  update(@Param('schoolId') schoolId: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolsService.update(schoolId, dto);
  }
}