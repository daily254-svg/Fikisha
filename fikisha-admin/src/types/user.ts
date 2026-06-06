import { UserRole } from './auth'

export interface User {
  id: string
  schoolId: string
  name: string
  phone: string
  email?: string
  role: UserRole
  status: string
  createdAt: string
  updatedAt: string
}

export interface Driver {
  id: string
  userId: string
  schoolId: string
  licenseNo?: string
  employeeNo?: string
  createdAt: string
  user?: User
}

export interface Parent {
  id: string
  userId: string
  schoolId: string
  createdAt: string
  user?: User
}

export interface CreateDriverDto {
  name: string
  phone: string
  email?: string
  role: 'DRIVER'
  licenseNo?: string
  employeeNo?: string
}

export interface CreateParentDto {
  name: string
  phone: string
  email?: string
  role: 'PARENT'
}

export interface UpdateUserDto {
  name?: string
  phone?: string
  email?: string
}
