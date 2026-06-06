export interface Student {
  id: string
  schoolId: string
  admissionNo: string
  firstName: string
  lastName: string
  grade?: string
  gender?: string
  createdAt: string
}

export interface ParentStudent {
  id: string
  parentId: string
  studentId: string
  relationship: string
  isPrimary: boolean
  createdAt: string
}

export interface CreateStudentDto {
  admissionNo: string
  firstName: string
  lastName: string
  grade?: string
  gender?: string
}

export interface UpdateStudentDto extends Partial {}

export interface LinkParentDto {
  parentId: string
  relationship: string
  isPrimary?: boolean
}
