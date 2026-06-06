export interface GpsUpdate {
  busId: string
  lat: number
  lng: number
  speed?: number
  heading?: number
  updatedAt: string
}

export interface BusLocationUpdate extends GpsUpdate {}

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
