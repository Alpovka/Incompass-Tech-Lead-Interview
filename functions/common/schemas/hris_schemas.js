import { object, boolean, string } from 'yup'

const createFinchConnectSession = object().shape({
  dataSync: boolean().optional()
})

const getFinchEmployerData = object().shape({
  code: string().optional(),
  dataSync: boolean().optional()
})

const toggleDataSync = object().shape({
  enabled: boolean().required()
})

export default {
  getFinchEmployerData,
  toggleDataSync,
  createFinchConnectSession
}

