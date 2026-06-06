import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolGuard } from '../../common/guards/school.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('tracking')
@UseGuards(JwtAuthGuard, SchoolGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('buses/:busId/location')
  getLocation(
    @CurrentUser() user: JwtPayload,
    @Param('busId') busId: string,
  ) {
    return this.trackingService.getBusLocation(user.schoolId, busId);
  }

  @Get('buses/:busId/history')
  getHistory(
    @CurrentUser() user: JwtPayload,
    @Param('busId') busId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.trackingService.getLocationHistory(user.schoolId, busId, limit);
  }
}