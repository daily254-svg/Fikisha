import { get } from './api';
import { ENDPOINTS } from '@/constants/api';
import { DriverProfile, ActiveBusAssignment, RouteStudents } from '@/types';

export const driversService = {
  getProfile: (): Promise<{ data: DriverProfile }> => get(ENDPOINTS.drivers.me),
  getActiveBus: (): Promise<{ data: ActiveBusAssignment | null }> => get(ENDPOINTS.drivers.bus),
  getRouteStudents: (): Promise<{ data: RouteStudents[] }> => get(ENDPOINTS.drivers.routeStudents),
};
