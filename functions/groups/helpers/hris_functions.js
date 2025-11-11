import Finch from '@tryfinch/finch-api'

// Base version - only has createEmployerClient (getFinchData comes in PR)
const createEmployerClient = ({ accessToken }) => new Finch({ accessToken })

export { createEmployerClient }

