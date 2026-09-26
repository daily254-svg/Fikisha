import { get } from './api';
import { BusLocationResponse, TransportEvent } from '@/types';

export const trackingService = {
  getBusLocation: (busId: string): Promise<{ data: BusLocationResponse }> =>
    get(`/tracking/buses/${busId}/location`),

  getBusHistory: (busId: string, limit = 50) =>
    get(`/tracking/buses/${busId}/history`, { limit }),

  getTransportEvents: (filters?: {
    studentId?: string;
    busId?: string;
    type?: string;
    date?: string;
    limit?: number;
  }): Promise<{ data: TransportEvent[] }> => get('/transport-events', filters),
};