import { object, string } from 'yup'

// Base version WITHOUT createFinchConnectSession and toggleDataSync schemas (those come in PR)
const getFinchEmployerData = object().shape({
  code: string().required()
})

export default { getFinchEmployerData }

