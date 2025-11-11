// Finch Connect hook (WITH dataSync parameter)
import { useMutation } from 'react-query'
import hrisRepo from '/src/data/repos/hris-repo.jsx'

export const useFinchConnect = ({ dataSync = false } = {}) => {
  return useMutation({
    mutationFn: async () => {
      const response = await hrisRepo.createFinchConnectSession({ dataSync })

      // Redirect to the finch page
      window.location.href = response.connectUrl

      return response
    }
  })
}

