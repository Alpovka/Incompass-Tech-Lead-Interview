// Generic GET request hook (WITH CHECK_CONNECTION and TOGGLE_DATA_SYNC)
import { useQuery } from 'react-query'
import hrisRepo from '/src/data/repos/hris-repo.jsx'

export const Endpoints = {
  GET_USER: 'getUser',
  GET_FINCH_EMPLOYER_DATA: 'getFinchEmployerData',
  CHECK_CONNECTION: 'checkConnection',
  TOGGLE_DATA_SYNC: 'toggleDataSync'
}

const repoEndpoints = {
  getFinchEmployerData: (data) => hrisRepo.getFinchEmployerData(data),
  checkConnection: () => hrisRepo.checkConnection(),
  toggleDataSync: (data) => hrisRepo.toggleDataSync(data)
}

export const useGetRequest = ({ endpoint, data, config = {} }) => {
  return useQuery({
    queryKey: [endpoint, data],
    queryFn: () => repoEndpoints[endpoint](data),
    ...config
  })
}

