export interface GpsUpdate {
  busId: string
  lat: number
  lng: number
  speed: number
  heading: number
  updatedAt: string
}

export interface BusLocationResponse {
  bus: {
    id: string
    registrationNumber: string
  }
  location: GpsUpdate | null
  isLive: boolean
  message?: string
}

export interface TransportEvent {
  id: string
  schoolId: string
  studentId: string
  busId: string
  type: 'PICKED_UP' | 'DROPPED_OFF' | 'ABSENT'
  latitude?: number
  longitude?: number
  createdAt: string
}

export interface StudentEventPayload {
  busId: string
  studentId: string
  lat?: number
  lng?: number
}
