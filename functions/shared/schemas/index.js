// Export all schemas
import * as hrisSchemas from './hris-schemas.js'
import * as userSchemas from './user-schemas.js'

export default {
  ...hrisSchemas,
  ...userSchemas
}

