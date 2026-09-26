import { get, post, patch, del } from './api'
import { Bus, CreateBusDto, UpdateBusDto, AssignDriverDto, BusAssignment } from '@/types'

export const busesService = {
  findAll: () => get<Bus[]>('/buses'),

  findById: (busId: string) => get<Bus>(`/buses/${busId}`),

  create: (dto: CreateBusDto) => post<Bus>('/buses', dto),

  update: (busId: string, dto: UpdateBusDto) => patch<Bus>(`/buses/${busId}`, dto),

  assignDriver: (busId: string, dto: AssignDriverDto) =>
    post<BusAssignment>(`/buses/${busId}/assign-driver`, dto),

  unassignDriver: (busId: string) =>
    del<{ message: string }>(`/buses/${busId}/unassign-driver`),
}
