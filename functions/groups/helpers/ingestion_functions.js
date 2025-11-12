// Ingestion helper functions (WITH dataSync modifications)
import { INGESTION_MODES } from '../../shared/constants/integration-constants.js'

/**
 * Check if users to be deleted or updated are in active evaluations
 * WITH dataSync - filters out users in active cycles when dataSync is enabled
 */
const checkEvaluations = async ({
  companyEvaluations = [],
  invoker,
  usersToUpdate = [],
  usersToDelete = []
}) => {
  const isDataSync = invoker.uid === 'dataSync'
  const statuses = ['ONGOING', 'AWAITING_RESULTS']

  // Initialize check objects for each status
  const deletionCheck = Object.fromEntries(statuses.map((s) => [s, {}]))
  const updateCheck = Object.fromEntries(statuses.map((s) => [s, {}]))

  // Set to remove users from usersToDelete and usersToUpdate
  const toRemoveDeletedUsers = new Set()
  const toRemoveUpdatedUsers = new Set()

  // For each evaluation, check if there are usersToDelete or usersToUpdate in them
  for (const evaluation of companyEvaluations) {
    const { status, uid, users } = evaluation
    for (const user of usersToDelete) {
      if (users.includes(user.uid)) {
        if (isDataSync) {
          toRemoveDeletedUsers.add(user.uid)
        } else {
          deletionCheck[status][uid] = deletionCheck[status][uid] || []
          deletionCheck[status][uid].push(user)
        }
      }
    }
    for (const user of usersToUpdate) {
      if (users.includes(user.uid)) {
        if (isDataSync) {
          toRemoveUpdatedUsers.add(user.uid)
        } else {
          updateCheck[status][uid] = updateCheck[status][uid] || []
          updateCheck[status][uid].push(user)
        }
      }
    }
  }

  // Update usersToDelete and usersToUpdate like this because they are assigned as constant outside
  const filteredUsersToDelete = usersToDelete.filter(
    (u) => !toRemoveDeletedUsers.has(u.uid)
  )
  usersToDelete.length = 0
  usersToDelete.push(...filteredUsersToDelete)

  const filteredUsersToUpdate = usersToUpdate.filter(
    (u) => !toRemoveUpdatedUsers.has(u.uid)
  )
  usersToUpdate.length = 0
  usersToUpdate.push(...filteredUsersToUpdate)

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

