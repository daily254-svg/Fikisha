import { post, patch } from './api';
import { LoginDto, LoginResponse, ChangePasswordDto } from '@/types';

export const authService = {
  login: (dto: LoginDto): Promise<{ data: LoginResponse }> =>
    post('/auth/login', dto),

  changePassword: (dto: ChangePasswordDto): Promise<{ data: { message: string } }> =>
    patch('/auth/change-password', dto),

  updateFcmToken: (fcmToken: string | null): Promise<{ data: { message: string } }> =>
    patch('/auth/fcm-token', { fcmToken }),
};