export interface Student {
  id: string
  schoolId: string
  admissionNo: string
  firstName: string
  lastName: string
  grade?: string
  gender?: string
  createdAt: string
  routes?: StudentRoute[]
}

export interface StudentRoute {
  id: string
  studentId: string
  routeId: string
  pickupStopId?: string
  dropoffStopId?: string
  active: boolean
  route?: {
    id: string
    name: string
    direction: 'MORNING' | 'EVENING'
    bus?: {
      id: string
      registrationNumber: string
    }
    stops?: RouteStop[]
  }
}

export interface RouteStop {
  id: string
  name: string
  latitude: number
  longitude: number
  sequence: number
  radiusMeters: number
}
