import { get, post, patch } from './api'
import { User, CreateDriverDto, CreateParentDto, UpdateUserDto } from '@/types'

export const usersService = {
  findAll: () => get<User[]>('/users'),

  findById: (userId: string) => get<User>(`/users/${userId}`),

  createDriver: (dto: CreateDriverDto) =>
    post<{ user: User; driver: unknown }>('/users/drivers', dto),

  createParent: (dto: CreateParentDto) =>
    post<{ user: User; parent: unknown }>('/users/parents', dto),

  update: (userId: string, dto: UpdateUserDto) =>
    patch<User>(`/users/${userId}`, dto),
}
