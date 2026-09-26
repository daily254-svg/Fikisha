export type RouteDirection = 'MORNING' | 'EVENING'

export interface Route {
  id: string
  schoolId: string
  name: string
  direction: RouteDirection
  busId?: string | null
  createdAt: string
  stops?: RouteStop[]
  bus?: { id: string; registrationNumber: string } | null
  students?: StudentRoute[]
}

export interface StudentRoute {
  studentId: string
  routeId: string
  pickupStopId?: string | null
  dropoffStopId?: string | null
  student?: {
    id: string
    firstName: string
    lastName: string
    admissionNo: string
  }
}

export interface RouteStop {
  id: string
  routeId: string
  schoolId: string
  name: string
  latitude: number
  longitude: number
  sequence: number
  radiusMeters: number
}

export interface CreateStopDto {
  name: string
  latitude: number
  longitude: number
  sequence: number
  radiusMeters?: number
}

export interface CreateRouteDto {
  name: string
  direction: RouteDirection
  busId?: string
  stops: CreateStopDto[]
}

export interface UpdateRouteDto {
  name?: string
  direction?: RouteDirection
  busId?: string
}

export interface AssignStudentDto {
  studentId: string
  pickupStopId?: string
  dropoffStopId?: string
}
