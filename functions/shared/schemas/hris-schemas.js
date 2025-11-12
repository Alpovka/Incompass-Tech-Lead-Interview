import { array, object, boolean, string } from 'yup'

// Response schemas for HRIS endpoints
export const createFinchConnectSession = object()
  .shape({
    connectUrl: string().required()
  })
  .noUnknown()

export const getFinchEmployerData = object().shape({
  employees: array().of(object())
})

export const checkConnection = object().shape({
  connectionExists: boolean().required()
})

export const toggleDataSync = object().shape({
  enabled: boolean().required()
})

