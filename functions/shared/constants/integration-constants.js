// Constants for data ingestion and integration
export const INGESTION_MODES = Object.freeze({
  MERGE: 'merge',
  OVERWRITE: 'overwrite'
})

export const VALIDATIONS = Object.freeze({
  REPEATING_EMAILS: 'repeatingEmails',
  SELF_MANAGERS: 'selfManagers',
  SELF_SECOND_MANAGERS: 'selfSecondManagers',
  ABSENT_MANAGERS: 'absentManagers',
  EMAIL_DUPLICATION: 'emailDuplication',
  EMPLOYEE_OF_ABSENT_MANAGERS: 'employeeOfAbsentManagers',
  INVOKER_ABSENT: 'invokerAbsent'
})

