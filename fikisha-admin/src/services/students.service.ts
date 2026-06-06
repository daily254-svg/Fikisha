import { get, post, patch, del } from './api'
import { Student, CreateStudentDto, UpdateStudentDto, LinkParentDto } from '@/types'

export const studentsService = {
  findAll: () =>
    get('/students'),

  findById: (studentId: string) =>
    get(`/students/${studentId}`),

  create: (dto: CreateStudentDto) =>
    post('/students', dto),

  update: (studentId: string, dto: UpdateStudentDto) =>
    patch(`/students/${studentId}`, dto),

  linkParent: (studentId: string, dto: LinkParentDto) =>
    post(`/students/${studentId}/parents`, dto),

  unlinkParent: (studentId: string, parentId: string) =>
    del(`/students/${studentId}/parents/${parentId}`),
}
