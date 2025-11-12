import Finch from '@tryfinch/finch-api'
import { createMapFromList } from './logic_functions.js'
import { USER_PROPERTY_KEYS } from '../../shared/constants/user-fields.js'

const getFinchData = async ({ accessToken }) => {
  // Create the employer client for all the employer based data
  const employerClient = new Finch({ accessToken })

  // Directory uses list() to get all the individual ids to fetch
  const directoryResponse = await employerClient.hris.directory.list()
  const individualIds = directoryResponse.individuals.map(
    (individual) => individual.id
  )

  /* These for loops are using the Finch API to fetch detailed information about multiple employees in batches  */
  /* The Finch API processes these requests in batches automatically to avoid overwhelming the HRIS system. Each iteration of the loop processes one batch. */
  /* The batch size is determined by the Finch API and is typically 20-25 requests at a time. */
  const individualsData = []
  for await (const individualResponse of employerClient.hris.individuals.retrieveMany(
    {
      requests: individualIds.map((id) => ({ individual_id: id }))
    }
  )) {
    individualsData.push(individualResponse.body)
  }
  const employmentData = []
  for await (const employmentResponse of employerClient.hris.employments.retrieveMany(
    {
      requests: individualIds.map((id) => ({ individual_id: id }))
    }
  )) {
    employmentData.push(employmentResponse.body)
  }

  // Create a map of data by id
  const individualMap = createMapFromList({
    givenList: individualsData,
    field: 'id'
  })
  const employmentMap = createMapFromList({
    givenList: employmentData,
    field: 'id'
  })

  // Map the individuals data to the employees object to parse it to fit our needs
  const employees = individualsData.map((individual) => {
    const employment = employmentMap[individual?.id] || undefined
    const manager = individualMap[employment?.manager?.id] || undefined
    const managerIsActive =
      employmentMap[employment?.manager?.id]?.is_active ?? false

    return {
      email:
        individual.emails?.find((email) => email.type === 'work')?.data || '',
      fullName: `${individual.first_name} ${individual.last_name}`,
      firstName: individual.first_name,
      lastName: individual.last_name,
      manager:
        manager && managerIsActive
          ? `${manager.first_name} ${manager.last_name}`
          : null,
      department: employment?.department?.name,
      location: employment?.location?.country || individual?.residence?.country,
      jobTitle: employment?.title,
      salary: employment?.income?.amount,
      isActive: employment?.is_active,
      startDate: employment?.start_date,
      gender: individual?.gender,
      race: individual?.ethnicity,
      // Division, Seniority, team, cohort,jobLevel, pod, second manager are not directly available
      // Therefore we use custom_fields to get those fields
      ...(employment.custom_fields ?? []).reduce((acc, field) => {
        if (USER_PROPERTY_KEYS.includes(field.name)) {
          acc[field.name] = field.value
        }
        return acc
      }, {})
    }
  })

  // Filter out inactive employees and remove isActive field
  const parsedEmployees = employees
    .filter((employee) => employee.isActive)
    .map(({ isActive, ...employee }) => employee)

  return parsedEmployees
}

export { getFinchData }


