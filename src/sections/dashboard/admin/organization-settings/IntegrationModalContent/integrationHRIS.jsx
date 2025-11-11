// HRIS Integration UI (base version WITHOUT connection check and data sync features)
import React, { useState, useCallback } from 'react'
import {
  Stack,
  Button,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Box
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useFinchConnect } from '/src/hooks/requests/use-finch-connect.jsx'
import { useGetRequest, Endpoints } from '/src/hooks/requests/use-get-request.jsx'
import { INGESTION_MODES } from '../../../../../../functions/shared/constants/integration-constants.js'

const IntegrationHRIS = ({ onClose }) => {
  const [modalState, setModalState] = useState({
    code: new URLSearchParams(window.location.search).get('code'),
    employees: null,
    selectedEmployees: null,
    mode: INGESTION_MODES.MERGE,
    isPreview: true
  })

  // Base version - fetches data using code from URL only
  const { isLoading: isLoadingFinchData, isError: isErrorFinchData } =
    useGetRequest({
      endpoint: Endpoints.GET_FINCH_EMPLOYER_DATA,
      data: {
        code: modalState?.code
      },
      config: {
        onSuccess: (data) =>
          setModalState((prev) => ({
            ...prev,
            employees: data.employees,
            selectedEmployees: data.employees,
            mode: INGESTION_MODES.MERGE,
            isPreview: true
          })),
        enabled: !!modalState?.code && !modalState?.employees,
        refetchOnWindowFocus: false,
        suspense: false
      }
    })

  const {
    mutateAsync: openFinchConnect,
    isLoading: isConnectingFinch,
    isSuccess: isConnected
  } = useFinchConnect()

  const handleFinchConnect = useCallback(async () => {
    try {
      await openFinchConnect()
    } catch (error) {
      console.error('Error connecting to Finch:', error)
    }
  }, [openFinchConnect])

  return (
    <>
      {/* Base version - simple connect button when no code */}
      {!modalState?.code ? (
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlinedIcon color="info" />
            <Typography variant="body2" color="text.secondary">
              Connect your HR system to upload your employee data to the platform. 
              We support various HR systems including BambooHR, Workday, and more.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleFinchConnect}
            disabled={isConnectingFinch || isConnected}
          >
            {isConnectingFinch
              ? 'Connecting...'
              : isConnected
              ? 'Redirecting...'
              : 'Connect your HR System'}
          </Button>
        </Stack>
      ) : null}

      {/* Loading state when fetching data */}
      {modalState?.code && isLoadingFinchData && !isErrorFinchData ? (
        <Stack spacing={2} alignItems="center" justifyContent="center" mt={4}>
          <Typography variant="subtitle2">
            Retrieving data from your HR system...
          </Typography>
          <CircularProgress />
        </Stack>
      ) : null}

      {/* Error state */}
      {isErrorFinchData ? (
        <Stack spacing={2}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            There was an error fetching your employee data from your HR system. 
            Please try again.
          </Alert>
          <Button
            variant="contained"
            onClick={handleFinchConnect}
            disabled={isConnectingFinch || isConnected}
          >
            {isConnectingFinch
              ? 'Connecting...'
              : isConnected
              ? 'Redirecting...'
              : 'Try Again'}
          </Button>
        </Stack>
      ) : null}

      {/* Success state - show employee data */}
      {!isErrorFinchData && modalState?.employees?.length > 0 ? (
        <Stack spacing={2}>
          <Alert severity="success">
            <AlertTitle>Success!</AlertTitle>
            Retrieved {modalState.employees.length} employees from your HR system.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            These are the active employees that we found in your HR system. 
            You can now upload them into the system.
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Sample Employees:
            </Typography>
            {modalState.employees.slice(0, 5).map((emp, idx) => (
              <Typography key={idx} variant="body2">
                • {emp.fullName} - {emp.email} - {emp.jobTitle || 'No title'}
              </Typography>
            ))}
            {modalState.employees.length > 5 && (
              <Typography variant="body2" color="text.secondary">
                ... and {modalState.employees.length - 5} more
              </Typography>
            )}
          </Box>

          <Button variant="contained" onClick={onClose}>
            Done
          </Button>
        </Stack>
      ) : null}
    </>
  )
}

export default IntegrationHRIS

