import { get, post, patch, del } from './api'
import { Student, CreateStudentDto, UpdateStudentDto, LinkParentDto, ParentStudent } from '@/types'

export const studentsService = {
  findAll: () => get<Student[]>('/students'),

  findById: (studentId: string) => get<Student>(`/students/${studentId}`),

  create: (dto: CreateStudentDto) => post<Student>('/students', dto),

  update: (studentId: string, dto: UpdateStudentDto) =>
    patch<Student>(`/students/${studentId}`, dto),

  linkParent: (studentId: string, dto: LinkParentDto) =>
    post<ParentStudent>(`/students/${studentId}/parents`, dto),

  unlinkParent: (studentId: string, parentId: string) =>
    del<{ message: string }>(`/students/${studentId}/parents/${parentId}`),
}
