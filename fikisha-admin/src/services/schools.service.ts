import { get, post, patch } from './api'
import { School, CreateSchoolDto, UpdateSchoolDto } from '@/types'

export const schoolsService = {
  findAll: () =>
    get('/schools'),

  findById: (schoolId: string) =>
    get(`/schools/${schoolId}`),

  create: (dto: CreateSchoolDto) =>
    post('/schools', dto),

  update: (schoolId: string, dto: UpdateSchoolDto) =>
    patch(`/schools/${schoolId}`, dto),
}
