import { get, post, patch } from './api'
import { School, CreateSchoolDto, UpdateSchoolDto } from '@/types'

export const schoolsService = {
  findAll: () => get<School[]>('/schools'),

  findById: (schoolId: string) => get<School>(`/schools/${schoolId}`),

  create: (dto: CreateSchoolDto) => post<School>('/schools', dto),

  update: (schoolId: string, dto: UpdateSchoolDto) =>
    patch<School>(`/schools/${schoolId}`, dto),
}
