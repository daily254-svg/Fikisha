export interface GpsUpdate {
  busId: string
  lat: number
  lng: number
  speed: number
  heading: number
  updatedAt: string
}

/** What GET /tracking/buses/:busId/location actually returns: the bus's last
 * known location (flat, no wrapper), or null if it has never reported one. */
export type BusLocationResponse = GpsUpdate | null

/** What GET /parents/me/students/:studentId/bus returns — a different,
 * wrapped shape from the tracking endpoint above. */
export interface StudentBusLocationResponse {
  bus: { id: string; registrationNumber: string } | null
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

export interface StudentEventPayload {
  busId: string
  studentId: string
  lat?: number
  lng?: number
}
