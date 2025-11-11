// HRIS integration endpoints (base version WITHOUT data sync features)
import { Finch } from '@tryfinch/finch-api'
import helperFunctions from './helper_functions.js'
import { createMapFromList } from './helpers/logic_functions.js'
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

const baseUrl = "http://localhost:3000"

// Create Finch Connect Session
export const createFinchConnectSession = async (req, res) => {
  try {
    const timerLabel = timerService.startTimer(
      'CloudFunctions - createFinchConnectSession'
    )

    const companyDoc = await helperFunctions.getCompanyDoc({
      uid: req.user.company
    })

    // Create the session (base version WITHOUT dataSync parameter)
    const session = await client.connect.sessions.new({
      products: ['directory', 'individual', 'employment'],
      customer_id: companyDoc.uid,
      customer_name: companyDoc.customizationConfig.name,
      redirect_uri: `${baseUrl}/admin/management`,
      sandbox: 'finch',
      manual: false
    })

    const response = {
      connectUrl: session.connect_url
    }

    timerService.endTimer(timerLabel)
    endMiddleware({ req, res, response })
  } catch (err) {
    return sendErrorResponse({ res, err })
  }
}

// Get employer data from Finch (base version - disconnects after fetching)
export const getFinchEmployerData = async (req, res) => {
  try {
    const timerLabel = timerService.startTimer(
      'CloudFunctions - getFinchEmployerData'
    )

    // Exchange the code for an access token
    const tokenResponse = await client.accessTokens.create({
      code: req.body.code,
      redirect_uri: `${baseUrl}/admin/management`
    })

    // Create the employer client
    const employerClient = helperFunctions.createEmployerClient({
      accessToken: tokenResponse.access_token
    })

    // Directory uses list() to get all the individual ids
    const directoryResponse = await employerClient.hris.directory.list()
    const individualIds = directoryResponse.individuals.map(
      (individual) => individual.id
    )

    // Fetch individuals and employment data in batches
    const individualsData = []
    for await (const individualResponse of employerClient.hris.individuals.retrieveMany(
      {
        requests: individualIds.map((id) => ({ individual_id: id }))
      }
    )) {
      individualsData.push(individualResponse.body)
    }

    const employmentData = []
    for await (const employmentResponse of employerClient.hris.employments.retrieveMany(
      {
        requests: individualIds.map((id) => ({ individual_id: id }))
      }
    )) {
      employmentData.push(employmentResponse.body)
    }

    // Disconnect after fetching (base version behavior)
    console.log('Disconnecting the employer client...')
    const disconnectResponse = await employerClient.account.disconnect()
    console.log('Disconnection response:', disconnectResponse.status)

    // Create maps for easy lookup
    const individualMap = createMapFromList({
      givenList: individualsData,
      field: 'id'
    })
    const employmentMap = createMapFromList({
      givenList: employmentData,
      field: 'id'
    })

    // Parse employee data
    const employees = individualsData.map((individual) => {
      const employment = employmentMap[individual.id] || undefined
      const manager = individualMap[employment?.manager?.id] || undefined

      return {
        email:
          individual.emails?.filter((email) => email.type === 'work')[0]
            ?.data || '',
        fullName: `${individual.first_name} ${individual.last_name}`,
        firstName: individual.first_name,
        lastName: individual.last_name,
        manager: manager
          ? `${manager?.first_name} ${manager?.last_name}`
          : null,
        division: employment?.department?.name,
        location:
          employment?.location?.country || individual?.residence?.country,
        jobTitle: employment?.title,
        salary: employment?.income?.amount,
        isActive: employment?.is_active,
        startDate: employment?.start_date,
        gender: individual?.gender,
        race: individual?.ethnicity,
        seniority: undefined,
        team: undefined,
        jobLevel: undefined
      }
    })

    // Filter out inactive employees
    const parsedEmployees = employees
      .filter((employee) => employee.isActive)
      .map((employee) => {
        delete employee.isActive
        return employee
      })

    const response = {
      employees: parsedEmployees
    }

    timerService.endTimer(timerLabel)
    endMiddleware({ req, res, response })
  } catch (err) {
    return sendErrorResponse({ res, err })
  }
}

