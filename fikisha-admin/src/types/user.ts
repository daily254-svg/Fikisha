import { UserRole } from './auth'

export interface User {
  id: string
  schoolId: string
  name: string
  phone: string
  email?: string | null
  role: UserRole
  status: string
  createdAt: string
  updatedAt: string
  driver?: DriverProfile | null
  parent?: ParentProfile | null
}

export interface DriverProfile {
  id: string
  userId: string
  schoolId: string
  licenseNo?: string | null
  employeeNo?: string | null
  createdAt: string
}

export interface ParentProfile {
  id: string
  userId: string
  schoolId: string
  createdAt: string
}

export interface Driver {
  id: string
  userId: string
  schoolId: string
  licenseNo?: string | null
  employeeNo?: string | null
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
