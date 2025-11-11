import { object, string, boolean } from 'yup'

// User schema
export const getUser = object()
  .shape({
    uid: string().required(),
    email: string().required(),
    displayName: string(),
    role: string().required(),
    company: string().required(),
    status: string().required(),
    features: object().notRequired(),
    permissions: object().notRequired(),
    dataSyncSetting: boolean().notRequired()
  })
  .noUnknown()

