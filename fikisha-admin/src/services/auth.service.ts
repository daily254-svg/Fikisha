import { post, patch, del } from './api'
import { LoginDto, LoginResponse, ChangePasswordDto } from '@/types'

export const authService = {
  login: (dto: LoginDto) => post<LoginResponse>('/auth/login', dto),

  changePassword: (dto: ChangePasswordDto) =>
    patch<{ message: string }>('/auth/change-password', dto),

  updateFcmToken: (fcmToken: string) =>
    patch<{ message: string }>('/auth/fcm-token', { fcmToken }),

  clearFcmToken: () => del<{ message: string }>('/auth/fcm-token'),
}
