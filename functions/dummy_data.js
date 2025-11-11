// Dummy data generation (base version WITHOUT dataSyncSetting)
import { featuresMap } from './shared/constants/features.js'
import { COMPANY_STATUS, USER_STATUS } from './consts/constants.js'

const createDummyData = async ({ organizationName, organizationDomain, isDemoAccount = false }) => {
  const company = {
    uid: 'mock-company-id',
    customizationConfig: {
      name: organizationName,
      logoDisplayMode: 'SHOW_NAME_AND_LOGO'
    },
    dataSyncSetting: false,
    features: {
      [featuresMap.GOALS]: true,
      [featuresMap.DATA_INGESTION]: !isDemoAccount,
      [featuresMap.LIMIT_FEEDBACK_RECEIVERS]: !isDemoAccount,
      [featuresMap.DEVELOPMENT_PLAN]: true,
      [featuresMap.REWARD_ALLOCATION]: true,
      [featuresMap.FINCH_INTEGRATION]: false,
      [featuresMap.DATA_SYNC]: false
    },
    domains: [organizationDomain],
    status: COMPANY_STATUS.ACTIVE
  }

  return { company }
}

export { createDummyData }

