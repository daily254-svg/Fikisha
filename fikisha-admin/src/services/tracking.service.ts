import { get } from './api'
import { LiveLocation, TransportEvent } from '@/types'

export const trackingService = {
  getBusLocation: (busId: string) =>
    get(`/tracking/buses/${busId}/location`),

  getBusHistory: (busId: string, limit?: number) =>
    get(`/tracking/buses/${busId}/history`, {
      params: { limit },
    }),

  getTransportEvents: (filters?: {
    studentId?: string
    busId?: string
    type?: string
    date?: string
    limit?: number
  }) =>
    get('/transport-events', { params: filters }),
}
