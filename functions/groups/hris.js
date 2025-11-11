// HRIS integration endpoints (WITH data sync features from PR)
import { Finch } from '@tryfinch/finch-api'
import { PROJECT_ID } from '../consts/constants.js'
import helperFunctions from './helper_functions.js'
import { createSecret, getSecret } from './helpers/secret_manager_functions.js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Initialize Finch API client
const client = new Finch({
  clientId: process.env.FINCH_CLIENT_ID,
  clientSecret: process.env.FINCH_CLIENT_SECRET
})

// Mock timer service
const timerService = {
  startTimer: (label) => label,
  endTimer: (label) => console.log('Timer ended:', label)
}

// Mock middleware
const endMiddleware = ({ req, res, response }) => {
  res.json(response)
}

const sendErrorResponse = ({ res, err }) => {
  console.error('Error:', err)
  res.status(500).json({ error: err.message })
}

const baseUrl = 'http://localhost:3000'

// Create Finch Connect Session (WITH dataSync support)
export const createFinchConnectSession = async (req, res) => {
  try {
    const timerLabel = timerService.startTimer(
      'CloudFunctions - createFinchConnectSession'
    )

    const companyDoc = await helperFunctions.getCompanyDoc({
      uid: req.user.company
    })

    // TODO: Check connection status and reauth based on introspect API

    // Create the session (WITH dataSync parameter)
    let session
    try {
      session = await client.connect.sessions.new({
        products: ['directory', 'individual', 'employment'],
        customer_id: companyDoc.uid,
        customer_name: companyDoc.customizationConfig.name,
        redirect_uri:
          `${baseUrl}/admin/management` +
          (req.body.dataSync ? '?dataSync=true' : ''),
        sandbox: PROJECT_ID !== process.env.PROJECT_ID && 'provider',
        manual: false
      })
    } catch (err) {
      if (err?.error?.message?.includes('existing connection')) {
        // If the connection already exists this means the access token became invalid
        // We need to re-authenticate
        session = await client.connect.sessions.reauthenticate({
          connection_id: err?.error?.context?.connection_id,
          customer_id: err?.error?.context?.customer_id,
          redirect_uri:
            `${baseUrl}/admin/management` +
            (req.body.dataSync ? '?dataSync=true' : ''),
          products: ['directory', 'individual', 'employment']
        })
      } else {
        throw err
      }
    }

    const response = {
      connectUrl: session.connect_url
    }

    timerService.endTimer(timerLabel)
    endMiddleware({ req, res, response })
  } catch (err) {
    return sendErrorResponse({ res, err })
  }
}

// Get employer data from Finch (WITH access token storage)
export const getFinchEmployerData = async (req, res) => {
  try {
    const timerLabel = timerService.startTimer(
      'CloudFunctions - getFinchEmployerData'
    )

    let accessToken

    if (req.body.code) {
      // Exchange the code for an access token (new connection flow)
      const tokenResponse = await client.accessTokens.create({
        code: req.body.code,
        redirect_uri:
          `${baseUrl}/admin/management` +
          (req.body.dataSync ? '?dataSync=true' : '')
      })

      accessToken = tokenResponse.access_token

      // Create the secret and update the company doc
      await Promise.all([
        createSecret({
          secretId: `access_tokens_${req.user.company}`,
          secretValue: accessToken
        }),
        helperFunctions.updateCompanyDoc({
          companyId: req.user.company,
          updatedFields: { dataSync: true }
        })
      ])
    } else {
      // Check for existing connection and use stored access token
      accessToken = await getSecret({
        secretId: `access_tokens_${req.user.company}`
      })
    }

    // No need to fetch data if the request made from dataSync
    const parsedEmployees = !req.body.dataSync
      ? await helperFunctions.getFinchData({
        accessToken
      })
      : []

    const response = {
      employees: parsedEmployees
    }

    // The logic before sending the response
    timerService.endTimer(timerLabel)
    endMiddleware({ req, res, response })
  } catch (err) {
    return sendErrorResponse({ res, err })
  }
}

// Check if the connection exists with the finch provider
export const checkConnection = async (req, res) => {
  try {
    const timerLabel = timerService.startTimer(
      'CloudFunctions - checkConnection'
    )

    let accessToken
    try {
      accessToken = await getSecret({
        secretId: `access_tokens_${req.user.company}`
      })
    } catch (error) {
      // Secret doesn't exist - no connection
      if (error.code === 5) {
        // NOT_FOUND error code
        timerService.endTimer(timerLabel)
        endMiddleware({ req, res, response: { connectionExists: false } })
        return
      }
      throw error
    }

    try {
      // Test the connection with Finch SDK with a directory request
      new Finch({ accessToken })
    } catch (err) {
      // If the access token is invalid, return false
      if (err.message.includes('access token is invalid')) {
        timerService.endTimer(timerLabel)
        endMiddleware({ req, res, response: { connectionExists: false } })
        return
      }

      throw err
    }

    // The logic before sending the response
    timerService.endTimer(timerLabel)
    endMiddleware({ req, res, response: { connectionExists: true } })
  } catch (err) {
    return sendErrorResponse({ res, err })
  }
}

// Toggle data sync setting
export const toggleDataSync = async (req, res) => {
  try {
    const timerLabel = timerService.startTimer(
      'CloudFunctions - toggleDataSync'
    )

    // Update the company doc
    await helperFunctions.updateCompanyDoc({
      companyId: req.user.company,
      updatedFields: {
        dataSyncSetting: req.body.enabled
      }
    })

    // The logic before sending the response
    timerService.endTimer(timerLabel)
    endMiddleware({ req, res, response: { enabled: req.body.enabled } })
  } catch (err) {
    return sendErrorResponse({ res, err })
  }
}
