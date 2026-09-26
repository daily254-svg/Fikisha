import { Driver } from './user'
import { LiveLocation } from './tracking'

export interface Bus {
  id: string
  schoolId: string
  registrationNumber: string
  capacity?: number
  createdAt: string
  assignments?: BusAssignment[]
  location?: BusLocation | null
  liveLocation?: LiveLocation | null
}

export interface BusAssignment {
  id: string
  busId: string
  driverId: string
  isActive: boolean
  startDate: string
  endDate?: string
  driver?: Driver
}

export interface BusLocation {
  busId: string
  latitude: number
  longitude: number
  speed?: number
  heading?: number
  updatedAt: string
}

export interface CreateBusDto {
  registrationNumber: string
  capacity?: number
}

export interface UpdateBusDto extends Partial<CreateBusDto> {}

export interface AssignDriverDto {
  driverId: string
}
