export interface School {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  plan: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateSchoolDto {
  name: string
  email?: string
  phone?: string
  address?: string
  plan?: string
}

export interface UpdateSchoolDto extends Partial {}
