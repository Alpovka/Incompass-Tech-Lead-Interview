// Access control settings (WITH DATA_SYNC)
import { featuresMap } from '../../functions/shared/constants/features.js'
import { ROLES, USER_STATUS } from '../../functions/consts/constants.js'

export const ACCESS_CONTROLS = {
  HRIS_INTEGRATION: [
    {
      roles: [ROLES.ADMIN],
      statuses: [USER_STATUS.ACTIVE],
      feature: featuresMap.FINCH_INTEGRATION
    }
  ],
  DATA_INGESTION: [
    {
      roles: [ROLES.ADMIN],
      statuses: [USER_STATUS.ACTIVE],
      feature: featuresMap.DATA_INGESTION
    }
  ],
  DATA_SYNC: [
    {
      roles: [ROLES.ADMIN],
      statuses: [USER_STATUS.ACTIVE],
      feature: featuresMap.DATA_SYNC
    }
  ]
}

