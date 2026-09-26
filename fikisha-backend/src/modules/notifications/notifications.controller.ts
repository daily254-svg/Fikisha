import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findMine(
    @CurrentUser() user: JwtPayload,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.prisma.notification.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: JwtPayload) {
    await this.prisma.notification.updateMany({
      where: { userId: user.sub, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }
}
