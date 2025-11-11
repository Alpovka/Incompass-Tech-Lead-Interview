import { array, object, string } from 'yup'

// Response schemas for HRIS endpoints (base version WITHOUT checkConnection and toggleDataSync)
export const createFinchConnectSession = object()
  .shape({
    connectUrl: string().required()
  })
  .noUnknown()

export const getFinchEmployerData = object().shape({
  employees: array().of(object())
})

