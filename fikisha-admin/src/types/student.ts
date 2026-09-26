export interface Student {
  id: string
  schoolId: string
  admissionNo: string
  firstName: string
  lastName: string
  grade?: string | null
  gender?: string | null
  createdAt: string
  parents?: ParentStudent[]
}

export interface ParentStudent {
  id: string
  parentId: string
  studentId: string
  relationship: string
  isPrimary: boolean
  createdAt: string
  parent?: {
    id: string
    userId: string
    schoolId: string
    createdAt: string
    user: {
      id: string
      name: string
      phone: string
      email?: string | null
    } | null
  }
}

export interface CreateStudentDto {
  admissionNo: string
  firstName: string
  lastName: string
  grade?: string
  gender?: string
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> {}

export interface LinkParentDto {
  parentId: string
  relationship: string
  isPrimary?: boolean
}
