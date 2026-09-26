import { get } from './api'
import { LiveLocation, BusLocationHistory, TransportEvent } from '@/types'

export const trackingService = {
  getBusLocation: (busId: string) =>
    get<LiveLocation | null>(`/tracking/buses/${busId}/location`),

  getBusHistory: (busId: string, limit?: number) =>
    get<BusLocationHistory[]>(`/tracking/buses/${busId}/history`, {
      params: { limit },
    }),

  getTransportEvents: (filters?: {
    studentId?: string
    busId?: string
    type?: string
    date?: string
    limit?: number
  }) => get<TransportEvent[]>('/transport-events', { params: filters }),
}
