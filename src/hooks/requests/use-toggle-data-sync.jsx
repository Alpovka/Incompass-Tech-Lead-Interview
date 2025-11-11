import { useMutation } from 'react-query'
import hrisRepo from '/src/data/repos/hris-repo.jsx'
import { toast } from 'react-toastify'

// Hook for toggling data sync functionality
export const useToggleDataSync = () => {
  return useMutation({
    mutationFn: async (enabled) => await hrisRepo.toggleDataSync({ enabled }),
    onSuccess: (data) => {
      const message = data.enabled
        ? 'Auto data sync is turned on! Your HR data will be updated every Sunday at midnight.'
        : 'Auto data sync is turned off.'

      toast.success(message)
    },
    onError: (error) => {
      console.warn('useToggleDataSync error:', error.message)
    }
  })
}

