// Finch Connect hook (base version WITHOUT dataSync parameter)
import { useMutation } from 'react-query'
import hrisRepo from '/src/data/repos/hris-repo.jsx'

export const useFinchConnect = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await hrisRepo.createFinchConnectSession()

      // Redirect to the finch page
      window.location.href = response.connectUrl

      return response
    }
  })
}

