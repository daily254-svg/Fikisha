import { post, patch } from './api'
import { LoginDto, LoginResponse, ChangePasswordDto } from '@/types'

export const authService = {
  login: (dto: LoginDto) =>
    post('/auth/login', dto),

  changePassword: (dto: ChangePasswordDto) =>
    patch('/auth/change-password', dto),

  updateFcmToken: (fcmToken: string) =>
    patch('/auth/fcm-token', { fcmToken }),

  clearFcmToken: () =>
    fetch('/auth/fcm-token', { method: 'DELETE' }),
}
