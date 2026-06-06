import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateFcmTokenDto } from '../users/dto/update-fcm-token.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';
import { Delete } from '@nestjs/common'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('fcm-token')
  updateFcmToken(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateFcmTokenDto,
  ) {
    return this.usersService.updateFcmToken(user.sub, dto.fcmToken);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('fcm-token')
  clearFcmToken(@CurrentUser() user: JwtPayload) {
    return this.usersService.clearFcmToken(user.sub)
  }
}