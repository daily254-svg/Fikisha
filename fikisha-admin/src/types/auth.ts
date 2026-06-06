export type UserRole = 'SCHOOL_ADMIN' | 'DRIVER' | 'PARENT'

export interface JwtPayload {
  sub: string
  schoolId: string
  role: UserRole
  phone: string
}

export interface AuthUser {
  id: string
  name: string
  phone: string
  email?: string
  role: UserRole
  schoolId: string
  fcmToken?: string
}

export interface LoginDto {
  phone: string
  password: string
  schoolId: string
}

export interface LoginResponse {
  accessToken: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
