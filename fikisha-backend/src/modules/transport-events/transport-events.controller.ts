import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransportEventsService } from './transport-events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { TransportEventType } from '../../../generated/prisma/client';

@Controller('transport-events')
@UseGuards(JwtAuthGuard, SchoolGuard, RolesGuard)
@Roles('SCHOOL_ADMIN', 'DRIVER', 'PARENT')
export class TransportEventsController {
  constructor(private readonly transportEventsService: TransportEventsService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('studentId') studentId?: string,
    @Query('busId') busId?: string,
    @Query('type') type?: TransportEventType,
    @Query('date') date?: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
  ) {
    return this.transportEventsService.findAll(user, {
      studentId,
      busId,
      type,
      date,
      limit,
    });
  }
}
