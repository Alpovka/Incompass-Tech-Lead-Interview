// Validation middleware (base version WITHOUT checkConnection and toggleDataSync)
import hrisSchemas from '../common/schemas/hris_schemas.js'
import schemas from '../shared/schemas/index.js'
import { featuresMap } from '../shared/constants/features.js'
import { ROLES, USER_STATUS } from '../consts/constants.js'

const { ACTIVE, DEMO } = USER_STATUS

// Map endpoints to their request validation schemas
const endpointsToSchemas = {
  // HRIS ENDPOINTS
  createFinchConnectSession: null,
  getFinchEmployerData: hrisSchemas.getFinchEmployerData,
  // OTHER ENDPOINTS
  getUser: null,
  ingestEmployeeData: null
}

// Map endpoints to their response validation schemas
const endpointsToResponseSchemas = {
  // HRIS ENDPOINTS
  createFinchConnectSession: schemas.createFinchConnectSession,
  getFinchEmployerData: schemas.getFinchEmployerData,
  // OTHER ENDPOINTS
  getUser: schemas.getUser
}

// Map endpoints to permitted roles
const endpointsToPermittedRoles = {
  // HRIS ENDPOINTS
  createFinchConnectSession: [ROLES.ADMIN],
  getFinchEmployerData: [ROLES.ADMIN],
  // OTHER ENDPOINTS
  getUser: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
  ingestEmployeeData: [ROLES.ADMIN]
}

// Map endpoints to required company features
const endpointsToCompanyFeatures = {
  createFinchConnectSession: featuresMap.FINCH_INTEGRATION,
  getFinchEmployerData: featuresMap.FINCH_INTEGRATION,
  ingestEmployeeData: featuresMap.DATA_INGESTION
}

// Map endpoints to required account statuses
const endpointsToAccountStatuses = {
  createFinchConnectSession: [ACTIVE],
  getFinchEmployerData: [ACTIVE],
  ingestEmployeeData: [ACTIVE],
  getUser: [ACTIVE, DEMO]
}

// Validation middleware
export const validateRequest = (req, res, next) => {
  const endpoint = req.path.replace('/', '')
  const schema = endpointsToSchemas[endpoint]

  if (schema) {
    try {
      schema.validateSync(req.body)
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
  }

  next()
}

export const validateResponse = (endpoint) => {
  return endpointsToResponseSchemas[endpoint]
}

export { endpointsToPermittedRoles, endpointsToCompanyFeatures, endpointsToAccountStatuses }

