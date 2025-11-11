// Feature flags for the application (WITHOUT DATA_SYNC - comes in PR)
const featuresMap = Object.freeze({
  GOALS: 'goals',
  DATA_INGESTION: 'dataIngestion',
  LIMIT_FEEDBACK_RECEIVERS: 'limitFeedbackReceivers',
  DEVELOPMENT_PLAN: 'developmentPlan',
  REWARD_ALLOCATION: 'rewardAllocation',
  FINCH_INTEGRATION: 'finchIntegration'
})

export { featuresMap }

