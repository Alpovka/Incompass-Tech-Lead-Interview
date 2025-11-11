// Other endpoints and scheduled functions
import { https, runWith } from 'firebase-functions'
import { MAIN_REGION } from '../consts/constants.js'
import { INGESTION_MODES } from '../shared/constants/integration-constants.js'
import helperFunctions from './helper_functions.js'
import { ingestUsers } from './ingest-users.js'
import { USER_PROPERTY_KEYS } from '../shared/constants/user-fields.js'
import { listSecrets, getSecret } from './helpers/secret_manager_functions.js'

const FUNCTION_DEFAULTS = {
    timeoutSeconds: 540,
    memory: '1GB'
}

// Scheduled Finch Data Sync - runs weekly
export const scheduledFinchDataSync = runWith(FUNCTION_DEFAULTS)
    .region(MAIN_REGION)
    .pubsub.schedule('0 0 * * 0') // weekly, every Sunday at midnight
    .timeZone('America/New_York')
    .onRun(async (context) => {
        try {
            // Get all access_tokens from Firestore (mock Secret Manager)
            const secrets = await listSecrets({
                filter: 'name:access_tokens'
            })

            const dataSyncEnabledCompanies = (
                await helperFunctions.batchGetOperation({
                    collectionName: 'organizations',
                    fieldName: 'dataSyncSetting',
                    values: [true]
                })
            ).filter((company) => company.features.dataSync)

            const companyByAccessTokens = {}
            await Promise.all(
                secrets.map(async (secret) => {
                    const companyId = secret.name.split('access_tokens_')[1]
                    if (
                        dataSyncEnabledCompanies
                            .map((company) => company.uid)
                            .includes(companyId)
                    ) {
                        companyByAccessTokens[companyId] = secret.data.value
                    }
                })
            )

            const injectionQueries = Object.keys(companyByAccessTokens).map(
                async (companyId) => {
                    // Get the access token
                    const accessToken = companyByAccessTokens[companyId]

                    // Get the Finch data
                    const freshData = await helperFunctions.getFinchData({ accessToken })

                    // Get all fields that users have in the system
                    const users = await helperFunctions.getCurrentUsers({
                        companyId
                    })

                    // This part is for getting only the fields that company is currently using in the system
                    const fieldsInUse = [
                        ...new Set(users.flatMap((user) => Object.keys(user)))
                    ].filter((field) =>
                        [
                            USER_PROPERTY_KEYS,
                            'email',
                            'fullName',
                            'firstName',
                            'lastName',
                            'manager',
                            'secondManager'
                        ].includes(field)
                    )
                    const dataWithFieldsInUse = freshData.map((user) => {
                        return fieldsInUse.reduce((acc, field) => {
                            acc[field] = user[field]
                            return acc
                        }, {})
                    })

                    // Update the company data with the Finch data
                    const { validations } = await ingestUsers({
                        data: dataWithFieldsInUse,
                        mode: INGESTION_MODES.OVERWRITE,
                        invoker: { company: companyId, uid: 'dataSync' }
                    })

                    // We need to throw error to track these validations
                    Object.keys(validations).forEach((key) => {
                        const value = validations[key]
                        if (Array.isArray(value) && value.length) {
                            throw new https.HttpsError(
                                'aborted',
                                `Validation "${key}" aborted the ingestion for company ${companyId}: ${key}:${value.join(
                                    ', '
                                )}.`
                            )
                        }
                        if (!Array.isArray(value) && value) {
                            throw new https.HttpsError(
                                'invalid-argument',
                                `Validation "${key}" aborted the ingestion for company ${companyId}.`
                            )
                        }
                    })
                }
            )

            // Await the promises and count fulfilled/rejected
            const results = await Promise.allSettled(injectionQueries)
            const failedResults = results.filter((r) => r.status === 'rejected')
            if (failedResults.length) {
                // Log failed companies for monitoring
                const failedCompanies = failedResults.map((r) => r.reason)
                console.error('Errors: ', failedCompanies)
                console.error(
                    `Finch scheduled data sync failed for ${failedResults.length} companies`
                )
            }

            return console.log('Scheduled HRIS data sync ended.')
        } catch (err) {
            console.error('Finch scheduled data sync failed:', err.message)
            throw new https.HttpsError('internal', err)
        }
    })

