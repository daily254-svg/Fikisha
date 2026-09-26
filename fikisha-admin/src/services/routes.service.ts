import { get, post, patch, del } from './api'
import {
  Route,
  CreateRouteDto,
  UpdateRouteDto,
  CreateStopDto,
  AssignStudentDto,
  RouteStop,
} from '@/types'

export const routesService = {
  findAll: () => get<Route[]>('/routes'),

  findById: (routeId: string) => get<Route>(`/routes/${routeId}`),

  create: (dto: CreateRouteDto) => post<Route>('/routes', dto),

  update: (routeId: string, dto: UpdateRouteDto) =>
    patch<Route>(`/routes/${routeId}`, dto),

  addStop: (routeId: string, dto: CreateStopDto) =>
    post<RouteStop>(`/routes/${routeId}/stops`, dto),

  removeStop: (routeId: string, stopId: string) =>
    del<{ message: string }>(`/routes/${routeId}/stops/${stopId}`),

  assignStudent: (routeId: string, dto: AssignStudentDto) =>
    post<unknown>(`/routes/${routeId}/students`, dto),

  unassignStudent: (routeId: string, studentId: string) =>
    del<{ message: string }>(`/routes/${routeId}/students/${studentId}`),
}
