import { get, post, patch } from './api'
import { User, Driver, Parent, CreateDriverDto, CreateParentDto, UpdateUserDto } from '@/types'

export const usersService = {
  findAll: () =>
    get('/users'),

  findById: (userId: string) =>
    get(`/users/${userId}`),

  createDriver: (dto: CreateDriverDto) =>
    post('/users/drivers', dto),

  createParent: (dto: CreateParentDto) =>
    post('/users/parents', dto),

  update: (userId: string, dto: UpdateUserDto) =>
    patch(`/users/${userId}`, dto),
}
