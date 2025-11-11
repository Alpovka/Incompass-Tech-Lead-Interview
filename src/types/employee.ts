export interface Employee {
  id: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  manager: string | null
  department: string | null
  location: string | null
  jobTitle: string | null
  startDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeInput {
  email: string
  firstName: string
  lastName: string
  manager?: string
  department?: string
  location?: string
  jobTitle?: string
  startDate?: string
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string
}

