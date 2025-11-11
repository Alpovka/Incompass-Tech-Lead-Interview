// Ingestion helper functions (base version WITHOUT dataSync modifications)
import { INGESTION_MODES } from '../../shared/constants/integration-constants.js'

/**
 * Check if users to be deleted or updated are in active evaluations
 * Base version - doesn't filter out users in active cycles for dataSync
 */
const checkEvaluations = async ({
  companyEvaluations = [],
  invoker,
  usersToUpdate = [],
  usersToDelete = []
}) => {
  const statuses = ['ONGOING', 'AWAITING_RESULTS']

  // Initialize check objects for each status
  const deletionCheck = Object.fromEntries(statuses.map((s) => [s, {}]))
  const updateCheck = Object.fromEntries(statuses.map((s) => [s, {}]))

  // For each evaluation, check if there are usersToDelete or usersToUpdate
  for (const evaluation of companyEvaluations) {
    const { status, uid, users } = evaluation
    for (const user of usersToDelete) {
      if (users.includes(user.uid)) {
        deletionCheck[status][uid] = deletionCheck[status][uid] || []
        deletionCheck[status][uid].push(user)
      }
    }
    for (const user of usersToUpdate) {
      if (users.includes(user.uid)) {
        updateCheck[status][uid] = updateCheck[status][uid] || []
        updateCheck[status][uid].push(user)
      }
    }
  }

  // Extract and format user names for each status
  const transformUsersObjectToUserFullNamesArray = (evaluationToUsers) =>
    Object.values(evaluationToUsers)
      .flat()
      .map((user) => user.fullName)
      .filter((name, index, self) => self.indexOf(name) === index)

  const result = {}
  for (const status of statuses) {
    const deleteUsers = transformUsersObjectToUserFullNamesArray(
      deletionCheck[status]
    )
    const updateUsers = transformUsersObjectToUserFullNamesArray(
      updateCheck[status]
    )

    if (deleteUsers.length || updateUsers.length) {
      result[status] = { deleteUsers, updateUsers }
    }
  }

  return result
}

export { checkEvaluations }

