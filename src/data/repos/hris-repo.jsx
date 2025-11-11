// HRIS repository (base version WITHOUT checkConnection and toggleDataSync)
import schemas from '../../../functions/shared/schemas/index.js'
import makeRequest from '../index.js'

const hrisRepo = {
  createFinchConnectSession: async () => {
    try {
      const result = await makeRequest({
        endpoint: 'createFinchConnectSession'
      })

      // validate the result
      const validatedResult = schemas.createFinchConnectSession.validateSync(result)

      return validatedResult
    } catch (error) {
      console.warn('error @hrisRepo -> createFinchConnectSession', error)
      throw error
    }
  },
  getFinchEmployerData: async (data) => {
    try {
      const result = await makeRequest({
        data,
        endpoint: 'getFinchEmployerData'
      })

      // validate the result
      const validatedResult = schemas.getFinchEmployerData.validateSync(result)

      return validatedResult
    } catch (error) {
      console.warn('error @hrisRepo -> getFinchEmployerData', error)
      throw error
    }
  }
  // checkConnection and toggleDataSync come in PR
}

export default hrisRepo

