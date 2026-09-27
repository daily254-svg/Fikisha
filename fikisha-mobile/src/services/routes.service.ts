import { get, post } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { ParentRoute, SelectRouteDto, StudentRoute } from '@/types';

export const routesService = {
  getRoutes: (): Promise<{ data: ParentRoute[] }> => get(ENDPOINTS.parents.routes),

  selectRoute: (
    studentId: string,
    dto: SelectRouteDto,
  ): Promise<{ data: StudentRoute }> => post(ENDPOINTS.parents.selectRoute(studentId), dto),
};
