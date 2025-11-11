import { object, string } from 'yup'

const createEmployee = object().shape({
  firstName: string().required('First name is required'),
  lastName: string().required('Last name is required'),
  email: string().email('Invalid email').required('Email is required'),
  department: string().optional(),
  jobTitle: string().optional(),
  manager: string().optional(),
  location: string().optional(),
  startDate: string().optional(),
  companyId: string().optional()
})

const updateEmployee = object().shape({
  firstName: string().optional(),
  lastName: string().optional(),
  email: string().email('Invalid email').optional(),
  department: string().optional(),
  jobTitle: string().optional(),
  manager: string().optional(),
  location: string().optional(),
  startDate: string().optional(),
  companyId: string().optional()
})

export default { createEmployee, updateEmployee }

