import { get, post, patch, del } from './api'
import { Bus, CreateBusDto, UpdateBusDto, AssignDriverDto } from '@/types'

export const busesService = {
  findAll: () =>
    get('/buses'),

  findById: (busId: string) =>
    get(`/buses/${busId}`),

  create: (dto: CreateBusDto) =>
    post('/buses', dto),

  update: (busId: string, dto: UpdateBusDto) =>
    patch(`/buses/${busId}`, dto),

  assignDriver: (busId: string, dto: AssignDriverDto) =>
    post(`/buses/${busId}/assign-driver`, dto),

  unassignDriver: (busId: string) =>
    del(`/buses/${busId}/unassign-driver`),
}
