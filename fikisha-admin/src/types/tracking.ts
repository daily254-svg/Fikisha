export interface GpsUpdate {
  busId: string
  lat: number
  lng: number
  speed?: number
  heading?: number
  updatedAt: string
}

export interface BusLocationUpdate extends GpsUpdate {}

export interface LiveLocation {
  lat: number
  lng: number
  speed?: number
  heading?: number
  updatedAt: string
}

export interface BusLocationHistory {
  id: string
  schoolId: string
  busId: string
  latitude: number
  longitude: number
  createdAt: string
}

export interface TransportEvent {
  id: string
  schoolId: string
  studentId: string
  busId: string
  type: 'PICKED_UP' | 'DROPPED_OFF' | 'ABSENT'
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  student?: {
    id: string
    firstName: string
    lastName: string
    admissionNo: string
  }
  bus?: {
    id: string
    registrationNumber: string
  }
}
