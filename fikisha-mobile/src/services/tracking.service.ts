import { get } from './api'
import { BusLocationResponse, TransportEvent } from '@/types'

export const trackingService = {
  getBusLocation: (busId: string) =>
    get(`/tracking/buses/${busId}/location`),

  getBusHistory: (busId: string, limit = 50) =>
    get(`/tracking/buses/${busId}/history`, {
      params: { limit },
    }),

  getTransportEvents: (filters?: {
    studentId?: string
    busId?: string
    type?: string
    date?: string
  }) =>
    get('/transport-events', { params: filters }),
}
