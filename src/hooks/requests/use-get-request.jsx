// Generic GET request hook (base version WITHOUT CHECK_CONNECTION and TOGGLE_DATA_SYNC)
import { useQuery } from 'react-query'
import hrisRepo from '/src/data/repos/hris-repo.jsx'

export const Endpoints = {
  GET_USER: 'getUser',
  GET_FINCH_EMPLOYER_DATA: 'getFinchEmployerData'
  // CHECK_CONNECTION and TOGGLE_DATA_SYNC come in PR
}

const repoEndpoints = {
  getFinchEmployerData: (data) => hrisRepo.getFinchEmployerData(data)
  // checkConnection and toggleDataSync come in PR
}

export const useGetRequest = ({ endpoint, data, config = {} }) => {
  return useQuery({
    queryKey: [endpoint, data],
    queryFn: () => repoEndpoints[endpoint](data),
    ...config
  })
}

