// Employee data ingestion (base version)
import { INGESTION_MODES, VALIDATIONS } from '../shared/constants/integration-constants.js'
import { checkEvaluations } from './helpers/ingestion_functions.js'

/**
 * Ingest employee data
 * Base version - checks invoker presence for all OVERWRITE modes
 */
export const ingestUsers = async ({ data, isPreview, invoker, mode }) => {
  const validations = {
    repeatingEmails: false,
    selfManagers: [],
    absentManagers: [],
    invokerAbsent: false
  }

  // Mock incoming users from data
  const incomingUsers = data || []

  // Check if invoker user is in incoming users (base version - always checks)
  validations.invokerAbsent = false
  if (mode === INGESTION_MODES.OVERWRITE) {
    validations.invokerAbsent = !incomingUsers.find(
      (user) => user.email === invoker.email
    )
  }

  // Mock evaluation checks
  const companyEvaluations = []
  const evaluationIssues = await checkEvaluations({
    companyEvaluations,
    invoker,
    usersToUpdate: [],
    usersToDelete: []
  })

  // Return preview or perform actual ingestion
  if (isPreview) {
    return {
      validations,
      preview: {
        usersToCreate: incomingUsers.slice(0, Math.floor(incomingUsers.length / 2)),
        usersToUpdate: [],
        usersToDelete: []
      }
    }
  }

  return {
    validations,
    success: true
  }
}

