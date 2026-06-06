import { get, post, patch, del } from './api'
import { Route, CreateRouteDto, UpdateRouteDto, CreateStopDto, AssignStudentDto } from '@/types'

export const routesService = {
  findAll: () =>
    get('/routes'),

  findById: (routeId: string) =>
    get(`/routes/${routeId}`),

  create: (dto: CreateRouteDto) =>
    post('/routes', dto),

  update: (routeId: string, dto: UpdateRouteDto) =>
    patch(`/routes/${routeId}`, dto),

  addStop: (routeId: string, dto: CreateStopDto) =>
    post(`/routes/${routeId}/stops`, dto),

  removeStop: (routeId: string, stopId: string) =>
    del(`/routes/${routeId}/stops/${stopId}`),

  assignStudent: (routeId: string, dto: AssignStudentDto) =>
    post(`/routes/${routeId}/students`, dto),

  unassignStudent: (routeId: string, studentId: string) =>
    del(`/routes/${routeId}/students/${studentId}`),
}
